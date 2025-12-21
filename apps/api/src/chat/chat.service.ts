import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService, ChatMessage } from '../ai/ai.service';
import { ModerationService } from '../moderation/moderation.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MeteredService } from '../meter/meter.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private moderation: ModerationService,
    private analytics: AnalyticsService,
    private meteredService: MeteredService,
  ) { }

  async saveMessage(
    conversationId: string,
    content: string,
    sender: 'USER' | 'CREATOR',
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        content,
        sender,
      },
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      include: {
        persona: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createConversation(userId: string, personaId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      const guestEmail = `${userId}@guest.creatorai.com`;
      await this.prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: guestEmail,
          name: 'Guest User',
          role: 'USER',
        },
      });
    }

    return this.prisma.conversation.upsert({
      where: {
        userId_personaId: {
          userId,
          personaId,
        },
      },
      update: {},
      create: {
        userId,
        personaId,
      },
      include: {
        persona: true,
        messages: {
          take: 15,
          orderBy: { createdAt: 'desc' }
        }
      },
    });
  }

  async sendMessage(userId: string, personaId: string, message: string) {
    // 0. Metering Check
    const { allowed, remaining } = await this.meteredService.checkLimit(userId);
    if (!allowed) {
      // Return a gentle error instead of throwing to keep the "no error" vibe if possible, 
      // but 403 is appropriate for limits. However, user said "NEVER SHOW TECHNICAL ERRORS". 
      // We'll let the controller handle 403 or return a special AI response.
      // For limit reached, it's better to be explicit but friendly.
      throw new ForbiddenException(
        'You ran out of messages! 🕒 Come back tomorrow!',
      );
    }

    // 1. Moderate Input
    const moderationResult = await this.moderation.checkContent(message);
    if (moderationResult.blocked) {
      await this.moderation.logViolation(
        userId,
        moderationResult.reason || 'CONTENT_VIOLATION',
        message,
      );
      // Return in-character refusal instead of error
      return {
        userMessage: { content: message, createdAt: new Date() }, // Mock
        aiMessage: { content: "I can't talk about that 🙅‍♀️", createdAt: new Date() },
        remainingMessages: remaining
      };
    }

    // 2. Setup Conversation
    const resolvedPersonaId = await this.resolvePersonaId(personaId);
    const conversation = await this.createConversation(userId, resolvedPersonaId);

    // 3. Save User Message
    const userMessage = await this.saveMessage(
      conversation.id,
      message,
      'USER',
    );
    await this.meteredService.incrementUsage(userId);

    // 4. Prepare History for AI (Stateless transformation)
    // We fetch from DB here because web might not send it yet, 
    // but we design it so we *could* accept it.
    // For now, fetching from DB ensures consistency.
    const rawHistory = await this.getMessages(conversation.id);
    const history: ChatMessage[] = rawHistory
      .slice(-15) // Keep it short per requirements
      .map(m => ({
        role: m.sender === 'USER' ? 'user' : 'assistant',
        content: m.content
      }));

    // 5. Generate AI Response
    // We treat the "personaId" as the character config ID if it matches, 
    // otherwise we might need to map DB persona to config.
    // For this rebuild, we assume we use the config ID. 
    // If resolvedPersonaId is a UUID, we might default to 'default' or map it.
    // Let's assume for now we use 'default' or a mapped one.
    // We'll trust the AI Service to handle the ID or default.
    const aiResponse = await this.aiService.generateResponse(
      resolvedPersonaId, // Pass the ID, service handles config lookup
      history,
      message
    );

    // 6. Save AI Response
    const aiMessage = await this.saveMessage(
      conversation.id,
      aiResponse.text,
      'CREATOR',
    );

    return {
      userMessage,
      aiMessage,
      tokensUsed: 0, // Not tracking tokens specifically anymore for user
      model: 'llama-3.1',
      remainingMessages: remaining > 0 ? remaining - 1 : -1,
    };
  }

  // Keeping streamMessage for backward compatibility but routing to new logic
  async *streamMessage(
    userId: string,
    personaId: string,
    message: string,
  ): AsyncGenerator<{
    type: 'chunk' | 'complete' | 'error';
    content?: string;
    messageId?: string;
    remainingMessages?: number;
  }> {
    try {
      // Reuse sendMessage logic but yield results
      const result = await this.sendMessage(userId, personaId, message);

      // Simulate streaming or just yield complete
      yield {
        type: 'chunk',
        content: result.aiMessage.content as string
      };

      yield {
        type: 'complete',
        messageId: 'id' in result.aiMessage ? result.aiMessage.id : `blocked-${Date.now()}`,
        remainingMessages: result.remainingMessages
      };

    } catch (error) {
      yield {
        type: 'error',
        content: "My brain is buffering... try again? 🔄"
      };
    }
  }

  async sendGift(
    userId: string,
    personaId: string,
    giftId: string,
    amount: number,
  ) {
    await this.prisma.coinWallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
      include: { creator: true },
    });

    if (persona && persona.creator) {
      const creatorShare = Math.floor(amount * 0.7);
      await this.prisma.creator.update({
        where: { id: persona.creator.id },
        data: { earnings: { increment: creatorShare } },
      });
    }

    const conversation = await this.createConversation(userId, personaId);

    return this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: `🎁 Sent a gift! (${amount} coins)`,
        sender: 'USER',
      },
    });
  }

  private async resolvePersonaId(idOrSlug: string): Promise<string> {
    // If it maps to a config ID, return it directly? 
    // Actually the DB personas presumably link to these configs or ARE these configs.
    // We will stick to the DB ID resolution for now to maintain referential integrity.
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idOrSlug)) return idOrSlug;

    const slugifiedName = idOrSlug.replace(/-/g, ' ');
    const persona = await this.prisma.persona.findFirst({
      where: {
        name: { contains: slugifiedName, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (!persona) {
      // Fallback for config-based IDs that might not be in DB yet? 
      // Or just throw. The Prompt says "Validate character exists".
      // We will let it throw if not found in DB, assuming DB is source of truth for IDs.
      throw new Error(`Persona not found: ${idOrSlug}`);
    }

    return persona.id;
  }
}
