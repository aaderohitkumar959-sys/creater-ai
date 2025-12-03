import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from '../llm/llm.service';
import { ModerationService } from '../moderation/moderation.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private llm: LLMService,
        private moderation: ModerationService,
        private analytics: AnalyticsService,
    ) { }

    async saveMessage(conversationId: string, content: string, sender: 'USER' | 'CREATOR') {
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
        const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
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
        // 0. Token Limit Check
        if (message.length > 2000) {
            throw new ForbiddenException('Message exceeds maximum length of 2000 characters.');
        }

        // 1. Pre-send moderation
        const moderationResult = await this.moderation.checkContent(message);

        if (!moderationResult.allowed) {
            // Log violation
            await this.moderation.logViolation(userId, message, moderationResult.categories);
            throw new ForbiddenException('Message blocked by moderation filters.');
        }

        // Get or create conversation
        const conversation = await this.createConversation(userId, personaId);

        // Save user message
        const userMessage = await this.saveMessage(conversation.id, message, 'USER');

        // Get conversation history
        const history = await this.getMessages(conversation.id);
        const historyForLLM = history
            .slice(-10) // Last 10 messages
            .map(msg => ({
                sender: msg.sender,
                content: msg.content,
            }));

        // Generate AI response
        const { content: aiResponse, tokensUsed, model } = await this.llm.generatePersonaResponse(
            personaId,
            message,
            historyForLLM
        );

        // 2. Post-response safety check
        const safetyCheck = await this.moderation.validateResponse(aiResponse);

        let finalResponse = aiResponse;
        if (!safetyCheck.safe) {
            finalResponse = "I apologize, but I cannot continue this conversation topic as it violates our safety guidelines.";
        }

        // Save AI response
        const aiMessage = await this.saveMessage(conversation.id, finalResponse, 'CREATOR');

        return {
            userMessage,
            aiMessage,
            tokensUsed,
            model,
        };
    }

    async *streamMessage(userId: string, personaId: string, message: string): AsyncGenerator<{
        type: 'chunk' | 'complete' | 'error';
        content?: string;
        messageId?: string;
        tokensUsed?: number;
        message?: string;
    }> {
        // 0. Token Limit Check (Approx 4 chars per token)
        if (message.length > 2000) {
            throw new ForbiddenException('Message exceeds maximum length of 2000 characters.');
        }

        // 1. Pre-send moderation
        const moderationResult = await this.moderation.checkContent(message);

        if (!moderationResult.allowed) {
            await this.moderation.logViolation(userId, message, moderationResult.categories);
            yield {
                type: 'complete',
                message: 'Message blocked by moderation filters.',
            };
            return;
        }

        // Get or create conversation
        const conversation = await this.createConversation(userId, personaId);

        // Save user message
        await this.saveMessage(conversation.id, message, 'USER');

        // Get conversation history
        const history = await this.getMessages(conversation.id);
        const historyForLLM = history
            .slice(-10)
            .map(msg => ({
                sender: msg.sender,
                content: msg.content,
            }));

        // Stream AI response
        let fullResponse = '';

        try {
            for await (const chunk of this.llm.streamPersonaResponse(personaId, message, historyForLLM)) {
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
        if (!safetyCheck.safe) {
            fullResponse = "[Content Redacted by Safety Filter]";
        }

        // Save complete AI response
        const aiMessage = await this.saveMessage(conversation.id, fullResponse, 'CREATOR');

        // Track analytics event
        await this.analytics.trackEvent(userId, 'MESSAGE_SENT', {
            personaId,
            tokensUsed: 0,
        });

        yield {
            type: 'complete',
            messageId: aiMessage.id,
        };
    }
}
