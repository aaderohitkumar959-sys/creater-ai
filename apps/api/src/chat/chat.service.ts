import { Injectable, ForbiddenException } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import { AIService, ChatMessage } from '../ai/ai.service';
import { ModerationService } from '../moderation/moderation.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MeteredService } from '../meter/meter.service';
import * as admin from 'firebase-admin';

@Injectable()
export class ChatService {
  constructor(
    private firestore: FirestoreService,
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
    const messageData = {
      conversationId,
      content,
      sender,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await this.firestore.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);

    return { id: docRef.id, ...messageData };
  }

  async getMessages(conversationId: string) {
    const snapshot = await this.firestore.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getUserConversations(userId: string) {
    const snapshot = await this.firestore.collection('conversations')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createConversation(userId: string, personaId: string) {
    const convId = `${userId}_${personaId}`;
    const convRef = this.firestore.collection('conversations').doc(convId);
    const doc = await convRef.get();

    if (!doc.exists) {
      await convRef.set({
        userId,
        personaId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await convRef.update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const persona = await this.firestore.findUnique('personas', personaId);
    const messages = await this.getMessages(convId);

    return {
      id: convId,
      userId,
      personaId,
      persona,
      messages: messages.slice(-15),
    };
  }

  async sendMessage(userId: string, personaId: string, message: string) {
    // 0. Metering Check
    const { allowed, remaining } = await this.meteredService.checkLimit(userId);
    if (!allowed) {
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
      return {
        userMessage: { content: message, createdAt: new Date() },
        aiMessage: { content: "I can't talk about that 🙅‍♀️", createdAt: new Date() },
        remainingMessages: remaining
      };
    }

    // 2. Setup Conversation
    const conversation = await this.createConversation(userId, personaId);

    // 3. Save User Message
    const userMessage = await this.saveMessage(
      conversation.id,
      message,
      'USER',
    );
    await this.meteredService.incrementUsage(userId);

    // 4. Prepare History for AI
    const history: ChatMessage[] = (conversation.messages as any[])
      .map(m => ({
        role: m.sender === 'USER' ? 'user' : 'assistant',
        content: m.content
      }));

    // 5. Generate AI Response
    const aiResponse = await this.aiService.generateResponse(
      personaId,
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
      tokensUsed: 0,
      model: 'llama-3.1',
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
    remainingMessages?: number;
  }> {
    try {
      const result = await this.sendMessage(userId, personaId, message);

      yield {
        type: 'chunk',
        content: result.aiMessage.content as string
      };

      yield {
        type: 'complete',
        messageId: result.aiMessage.id,
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
    await this.firestore.update('users', userId, {
      coinBalance: admin.firestore.FieldValue.increment(-amount),
    });

    const conversation = await this.createConversation(userId, personaId);

    return this.saveMessage(
      conversation.id,
      `🎁 Sent a gift! (${amount} coins)`,
      'USER',
    );
  }
}
