"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const llm_service_1 = require("../llm/llm.service");
const moderation_service_1 = require("../moderation/moderation.service");
const analytics_service_1 = require("../analytics/analytics.service");
const meter_service_1 = require("../meter/meter.service");
let ChatService = class ChatService {
    prisma;
    llm;
    moderation;
    analytics;
    meteredService;
    constructor(prisma, llm, moderation, analytics, meteredService) {
        this.prisma = prisma;
        this.llm = llm;
        this.moderation = moderation;
        this.analytics = analytics;
        this.meteredService = meteredService;
    }
    async saveMessage(conversationId, content, sender) {
        return this.prisma.message.create({
            data: {
                conversationId,
                content,
                sender,
            },
        });
    }
    async getMessages(conversationId) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getUserConversations(userId) {
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
    async createConversation(userId, personaId) {
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
            },
        });
    }
    async sendMessage(userId, personaId, message) {
        const { allowed, remaining } = await this.meteredService.checkLimit(userId);
        if (!allowed) {
            throw new common_1.ForbiddenException('Daily message limit reached. Upgrade to Premium for unlimited chats.');
        }
        if (message.length > 2000) {
            throw new common_1.ForbiddenException('Message exceeds maximum length of 2000 characters.');
        }
        const moderationResult = await this.moderation.checkContent(message);
        if (moderationResult.blocked) {
            await this.moderation.logViolation(userId, moderationResult.reason || 'CONTENT_VIOLATION', message);
            throw new common_1.ForbiddenException('Message blocked by moderation filters.');
        }
        const resolvedPersonaId = await this.resolvePersonaId(personaId);
        const conversation = await this.createConversation(userId, resolvedPersonaId);
        const userMessage = await this.saveMessage(conversation.id, message, 'USER');
        await this.meteredService.incrementUsage(userId);
        const history = await this.getMessages(conversation.id);
        const historyForLLM = history
            .slice(-10)
            .map((msg) => ({
            sender: msg.sender,
            content: msg.content,
        }));
        const { content: aiResponse, tokensUsed, model, } = await this.llm.generatePersonaResponse(resolvedPersonaId, message, historyForLLM);
        const safetyCheck = await this.moderation.validateResponse(aiResponse);
        let finalResponse = aiResponse;
        if (safetyCheck.blocked) {
            finalResponse =
                'I apologize, but I cannot continue this conversation topic as it violates our safety guidelines.';
        }
        const aiMessage = await this.saveMessage(conversation.id, finalResponse, 'CREATOR');
        return {
            userMessage,
            aiMessage,
            tokensUsed,
            model,
            remainingMessages: remaining > 0 ? remaining - 1 : -1,
        };
    }
    async *streamMessage(userId, personaId, message) {
        const { allowed, remaining } = await this.meteredService.checkLimit(userId);
        if (!allowed) {
            yield {
                type: 'error',
                message: 'Daily message limit reached. Upgrade to Premium for unlimited chats.',
            };
            return;
        }
        if (message.length > 2000) {
            throw new common_1.ForbiddenException('Message exceeds maximum length of 2000 characters.');
        }
        const moderationResult = await this.moderation.checkContent(message);
        if (moderationResult.blocked) {
            await this.moderation.logViolation(userId, moderationResult.reason || 'CONTENT_VIOLATION', message);
            yield {
                type: 'complete',
                message: 'Message blocked by moderation filters.',
            };
            return;
        }
        const resolvedPersonaId = await this.resolvePersonaId(personaId);
        const conversation = await this.createConversation(userId, resolvedPersonaId);
        await this.saveMessage(conversation.id, message, 'USER');
        await this.meteredService.incrementUsage(userId);
        const history = await this.getMessages(conversation.id);
        const historyForLLM = history.slice(-10).map((msg) => ({
            sender: msg.sender,
            content: msg.content,
        }));
        let fullResponse = '';
        try {
            for await (const chunk of this.llm.streamPersonaResponse(resolvedPersonaId, message, historyForLLM)) {
                fullResponse += chunk;
                yield {
                    type: 'chunk',
                    content: chunk,
                };
            }
        }
        catch (error) {
            console.error('Error during LLM streaming:', error);
            yield {
                type: 'error',
                message: error?.message || 'Failed to generate response',
            };
            return;
        }
        const safetyCheck = await this.moderation.validateResponse(fullResponse);
        if (safetyCheck.blocked) {
            fullResponse = '[Content Redacted by Safety Filter]';
        }
        const aiMessage = await this.saveMessage(conversation.id, fullResponse, 'CREATOR');
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
    async sendGift(userId, personaId, giftId, amount) {
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
    async resolvePersonaId(idOrSlug) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(idOrSlug))
            return idOrSlug;
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LLMService,
        moderation_service_1.ModerationService,
        analytics_service_1.AnalyticsService,
        meter_service_1.MeteredService])
], ChatService);
