import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from '../llm/llm.service';
import { ModerationService } from '../moderation/moderation.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MeteredService } from '../meter/meter.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private llm: LLMService,
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

  async createConversation(userId: string, personaId: string) {
    // Ensure user exists (for guest users)
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      // Create guest user if not exists
      // Use a dummy email for guest users
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
      },
    });
  }

  async sendMessage(userId: string, personaId: string, message: string) {
    // 0. Metering Check
    const { allowed, remaining } = await this.meteredService.checkLimit(userId);
    if (!allowed) {
      throw new ForbiddenException(
        'Daily message limit reached. Upgrade to Premium for unlimited chats.',
      );
    }

    // 1. Token Limit Check
    if (message.length > 2000) {
      throw new ForbiddenException(
        'Message exceeds maximum length of 2000 characters.',
      );
    }

    // 2. Pre-send moderation
    const moderationResult = await this.moderation.checkContent(message);

    if (moderationResult.blocked) {  // Fixed: was .allowed, now .blocked
      // Log violation
      await this.moderation.logViolation(
        userId,
        moderationResult.reason || 'CONTENT_VIOLATION',  // Fixed: was categories (array), now reason (string)
        message,
      );
      throw new ForbiddenException('Message blocked by moderation filters.');
    }

    // Get or create conversation
    const resolvedPersonaId = await this.resolvePersonaId(personaId);
    const conversation = await this.createConversation(userId, resolvedPersonaId);

    // Save user message
    const userMessage = await this.saveMessage(
      conversation.id,
      message,
      'USER',
    );

    // Increment usage
    await this.meteredService.incrementUsage(userId);

    // Get conversation history
    const history = await this.getMessages(conversation.id);
    const historyForLLM = history
      .slice(-10) // Last 10 messages
      .map((msg) => ({
        sender: msg.sender,
        content: msg.content,
      }));

    // Generate AI response
    const {
      content: aiResponse,
      tokensUsed,
      model,
    } = await this.llm.generatePersonaResponse(
      resolvedPersonaId,
      message,
      historyForLLM,
    );

    // 3. Post-response safety check
    const safetyCheck = await this.moderation.validateResponse(aiResponse);

    let finalResponse = aiResponse;
    if (safetyCheck.blocked) {  // Fixed: was .safe (inverted), now .blocked
      finalResponse =
        'I apologize, but I cannot continue this conversation topic as it violates our safety guidelines.';
    }

    // Save AI response
    const aiMessage = await this.saveMessage(
      conversation.id,
      finalResponse,
      'CREATOR',
    );

    return {
      userMessage,
      aiMessage,
      tokensUsed,
      model,
      remainingMessages: remaining > 0 ? remaining - 1 : -1,
    };
  }

  async *streamMessage(
    userId: string,
    personaId: string,
    message: string,
  ): AsyncGenerator<{
    type: 'chunk' | 'complete' | 'error';
    content?: string;
    messageId?: string;
    tokensUsed?: number;
    message?: string;
    remainingMessages?: number;
  }> {
    // 0. Metering Check
    const { allowed, remaining } = await this.meteredService.checkLimit(userId);
    if (!allowed) {
      yield {
        type: 'error',
        message:
          'Daily message limit reached. Upgrade to Premium for unlimited chats.',
      };
      return;
    }

    // 1. Token Limit Check (Approx 4 chars per token)
    if (message.length > 2000) {
      throw new ForbiddenException(
        'Message exceeds maximum length of 2000 characters.',
      );
    }

    // 2. Pre-send moderation
    const moderationResult = await this.moderation.checkContent(message);

    if (moderationResult.blocked) {  // Fixed: was .allowed (inverted), now .blocked
      await this.moderation.logViolation(
        userId,
        moderationResult.reason || 'CONTENT_VIOLATION',  // Fixed: was categories (array), now reason (string)
        message,
      );
      yield {
        type: 'complete',
        message: 'Message blocked by moderation filters.',
      };
      return;
    }

    // Get or create conversation
    const resolvedPersonaId = await this.resolvePersonaId(personaId);
    const conversation = await this.createConversation(userId, resolvedPersonaId);

    // Save user message
    await this.saveMessage(conversation.id, message, 'USER');

    // Increment usage
    await this.meteredService.incrementUsage(userId);

    // Get conversation history
    const history = await this.getMessages(conversation.id);
    const historyForLLM = history.slice(-10).map((msg) => ({
      sender: msg.sender,
      content: msg.content,
    }));

    // Stream AI response
    let fullResponse = '';

    try {
      for await (const chunk of this.llm.streamPersonaResponse(
        resolvedPersonaId,
        message,
        historyForLLM,
      )) {
        fullResponse += chunk;
        yield {
          type: 'chunk',
          content: chunk,
        };
      }
    } catch (error) {
      console.error('Error during LLM streaming:', error);
      // Send error as JSON
      yield {
        type: 'error',
        message: error?.message || 'Failed to generate response',
      };
      return;
    }

    // Post-response check (after full generation)
    const safetyCheck = await this.moderation.validateResponse(fullResponse);
    if (safetyCheck.blocked) {  // Fixed: was .safe (inverted), now .blocked
      fullResponse = '[Content Redacted by Safety Filter]';
    }

    // Save complete AI response
    const aiMessage = await this.saveMessage(
      conversation.id,
      fullResponse,
      'CREATOR',
    );

    // Track analytics event
    await this.analytics.trackEvent(userId, 'MESSAGE_SENT', {
      personaId,
      tokensUsed: 0,
    });

    yield {
      type: 'complete',
      messageId: aiMessage.id,
      remainingMessages: remaining > 0 ? remaining - 1 : -1,
    };
  }
  async sendGift(
    userId: string,
    personaId: string,
    giftId: string,
    amount: number,
  ) {
    // 1. Deduct coins from user
    await this.prisma.coinWallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    // 2. Credit creator (70% share)
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

    // 3. Create chat message
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
      throw new Error(`Persona not found for identifier: ${idOrSlug}`);
    }

    return persona.id;
  }
}
