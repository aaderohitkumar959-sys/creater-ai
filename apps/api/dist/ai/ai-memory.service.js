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
exports.AIMemoryService = exports.MemoryType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var MemoryType;
(function (MemoryType) {
    MemoryType["FACT"] = "FACT";
    MemoryType["PREFERENCE"] = "PREFERENCE";
    MemoryType["EVENT"] = "EVENT";
})(MemoryType || (exports.MemoryType = MemoryType = {}));
let AIMemoryService = class AIMemoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getShortTermMemory(conversationId) {
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                sender: true,
                content: true,
            },
        });
        return messages.reverse();
    }
    async getLongTermMemories(userId, personaId, limit = 10) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription || subscription.status !== 'ACTIVE') {
            return [];
        }
        const memories = await this.prisma.memory.findMany({
            where: {
                userId,
                personaId,
            },
            orderBy: [
                { importance: 'desc' },
                { lastAccessedAt: 'desc' },
            ],
            take: limit,
        });
        const memoryIds = memories.map((m) => m.id);
        if (memoryIds.length > 0) {
            await this.prisma.memory.updateMany({
                where: { id: { in: memoryIds } },
                data: { lastAccessedAt: new Date() },
            });
        }
        return memories.map(m => ({
            ...m,
            type: m.type,
        }));
    }
    async extractMemoriesFromConversation(conversationId, userId, personaId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription || subscription.status !== 'ACTIVE') {
            return 0;
        }
        const messages = await this.prisma.message.findMany({
            where: {
                conversationId,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        if (messages.length === 0) {
            return 0;
        }
        const extractedMemories = [];
        const preferenceKeywords = ['prefer', 'like', 'love', 'favorite', 'enjoy'];
        const factKeywords = ['am', 'work', 'live', 'study', 'major'];
        const eventKeywords = ['went to', 'visited', 'traveled', 'celebrated'];
        for (const message of messages) {
            if (message.sender !== 'USER')
                continue;
            const content = message.content.toLowerCase();
            if (preferenceKeywords.some((kw) => content.includes(kw))) {
                extractedMemories.push({
                    type: MemoryType.PREFERENCE,
                    content: message.content,
                    importance: 5,
                });
            }
            if (factKeywords.some((kw) => content.includes(kw))) {
                extractedMemories.push({
                    type: MemoryType.FACT,
                    content: message.content,
                    importance: 7,
                });
            }
            if (eventKeywords.some((kw) => content.includes(kw))) {
                extractedMemories.push({
                    type: MemoryType.EVENT,
                    content: message.content,
                    importance: 6,
                });
            }
        }
        let savedCount = 0;
        for (const memory of extractedMemories) {
            try {
                await this.prisma.memory.create({
                    data: {
                        userId,
                        personaId,
                        type: memory.type,
                        content: memory.content,
                        importance: memory.importance,
                        lastAccessedAt: new Date(),
                    },
                });
                savedCount++;
            }
            catch (error) {
                console.error('[MEMORY] Failed to save:', error.message);
            }
        }
        console.log('[MEMORY] Extracted memories:', {
            userId,
            personaId,
            count: savedCount,
        });
        return savedCount;
    }
    async getUserMemories(userId, personaId) {
        const where = { userId };
        if (personaId) {
            where.personaId = personaId;
        }
        const memories = await this.prisma.memory.findMany({
            where,
            orderBy: [
                { importance: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return memories.map(m => ({
            ...m,
            type: m.type,
        }));
    }
    async deleteMemory(memoryId, userId) {
        try {
            await this.prisma.memory.deleteMany({
                where: {
                    id: memoryId,
                    userId,
                },
            });
            console.log('[MEMORY] Deleted:', { memoryId, userId });
            return true;
        }
        catch (error) {
            console.error('[MEMORY] Delete failed:', error.message);
            return false;
        }
    }
    async deleteAllUserMemories(userId) {
        const result = await this.prisma.memory.deleteMany({
            where: { userId },
        });
        console.log('[MEMORY] Deleted all for user:', {
            userId,
            count: result.count,
        });
        return result.count;
    }
    formatMemoriesForContext(memories) {
        if (memories.length === 0) {
            return '';
        }
        const formattedMemories = memories
            .map((m) => `- ${m.type}: ${m.content}`)
            .join('\n');
        return `\nRemembered about this user:\n${formattedMemories}\n`;
    }
    async getMemoryStats(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        const hasPremium = subscription?.status === 'ACTIVE';
        if (!hasPremium) {
            return {
                totalMemories: 0,
                byType: {
                    [MemoryType.FACT]: 0,
                    [MemoryType.PREFERENCE]: 0,
                    [MemoryType.EVENT]: 0,
                },
                hasPremium: false,
            };
        }
        const memories = await this.prisma.memory.findMany({
            where: { userId },
        });
        const byType = {
            [MemoryType.FACT]: memories.filter((m) => m.type === MemoryType.FACT)
                .length,
            [MemoryType.PREFERENCE]: memories.filter((m) => m.type === MemoryType.PREFERENCE).length,
            [MemoryType.EVENT]: memories.filter((m) => m.type === MemoryType.EVENT)
                .length,
        };
        return {
            totalMemories: memories.length,
            byType,
            hasPremium: true,
        };
    }
};
exports.AIMemoryService = AIMemoryService;
exports.AIMemoryService = AIMemoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIMemoryService);
