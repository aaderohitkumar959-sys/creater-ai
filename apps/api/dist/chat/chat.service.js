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
const ai_service_1 = require("../ai/ai.service");
const moderation_service_1 = require("../moderation/moderation.service");
const analytics_service_1 = require("../analytics/analytics.service");
const meter_service_1 = require("../meter/meter.service");
let ChatService = class ChatService {
    prisma;
    aiService;
    moderation;
    analytics;
    meteredService;
    constructor(prisma, aiService, moderation, analytics, meteredService) {
        this.prisma = prisma;
        this.aiService = aiService;
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
                messages: {
                    take: 15,
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
    }
    async sendMessage(userId, personaId, message) {
        const { allowed, remaining } = await this.meteredService.checkLimit(userId);
        if (!allowed) {
            throw new common_1.ForbiddenException('You ran out of messages! 🕒 Come back tomorrow!');
        }
        const moderationResult = await this.moderation.checkContent(message);
        if (moderationResult.blocked) {
            await this.moderation.logViolation(userId, moderationResult.reason || 'CONTENT_VIOLATION', message);
            return {
                userMessage: { content: message, createdAt: new Date() },
                aiMessage: { content: "I can't talk about that 🙅‍♀️", createdAt: new Date() },
                remainingMessages: remaining
            };
        }
        const resolvedPersonaId = await this.resolvePersonaId(personaId);
        const conversation = await this.createConversation(userId, resolvedPersonaId);
        const userMessage = await this.saveMessage(conversation.id, message, 'USER');
        await this.meteredService.incrementUsage(userId);
        const rawHistory = await this.getMessages(conversation.id);
        const history = rawHistory
            .slice(-15)
            .map(m => ({
            role: m.sender === 'USER' ? 'user' : 'assistant',
            content: m.content
        }));
        const aiResponse = await this.aiService.generateResponse(resolvedPersonaId, history, message);
        const aiMessage = await this.saveMessage(conversation.id, aiResponse.text, 'CREATOR');
        return {
            userMessage,
            aiMessage,
            tokensUsed: 0,
            model: 'llama-3.1',
            remainingMessages: remaining > 0 ? remaining - 1 : -1,
        };
    }
    async *streamMessage(userId, personaId, message) {
        try {
            const result = await this.sendMessage(userId, personaId, message);
            yield {
                type: 'chunk',
                content: result.aiMessage.content
            };
            yield {
                type: 'complete',
                messageId: 'id' in result.aiMessage ? result.aiMessage.id : `blocked-${Date.now()}`,
                remainingMessages: result.remainingMessages
            };
        }
        catch (error) {
            yield {
                type: 'error',
                content: "My brain is buffering... try again? 🔄"
            };
        }
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
            throw new Error(`Persona not found: ${idOrSlug}`);
        }
        return persona.id;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService,
        moderation_service_1.ModerationService,
        analytics_service_1.AnalyticsService,
        meter_service_1.MeteredService])
], ChatService);
