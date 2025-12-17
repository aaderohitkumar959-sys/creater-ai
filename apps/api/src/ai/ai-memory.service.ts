import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum MemoryType {
    FACT = 'FACT', // "User prefers coffee over tea"
    PREFERENCE = 'PREFERENCE', // "User likes horror movies"
    EVENT = 'EVENT', // "User mentioned vacation to Japan"
}

interface Memory {
    id: string;
    userId: string;
    personaId: string;
    type: MemoryType;
    content: string;
    importance: number; // 1-10
    createdAt: Date;
    lastAccessedAt: Date;
}

@Injectable()
export class AIMemoryService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get short-term memory (last 20 messages)
     * Available to all users
     */
    async getShortTermMemory(conversationId: string): Promise<
        Array<{ sender: string; content: string }>
    > {
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                sender: true,
                content: true,
            },
        });

        // Reverse to get chronological order
        return messages.reverse();
    }

    /**
     * Get long-term memories for context
     * Premium feature only
     */
    async getLongTermMemories(
        userId: string,
        personaId: string,
        limit: number = 10,
    ): Promise<Memory[]> {
        // Check if user has premium
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription || subscription.status !== 'ACTIVE') {
            return []; // No long-term memory for free users
        }

        // Get most important and recent memories
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

        // Update last accessed time
        const memoryIds = memories.map((m) => m.id);
        if (memoryIds.length > 0) {
            await this.prisma.memory.updateMany({
                where: { id: { in: memoryIds } },
                data: { lastAccessedAt: new Date() },
            });
        }

        // Cast Prisma's string type to MemoryType enum
        return memories.map(m => ({
            ...m,
            type: m.type as MemoryType,
        }));
    }

    /**
     * Extract memories from conversation
     * Called periodically or after conversation ends
     */
    async extractMemoriesFromConversation(
        conversationId: string,
        userId: string,
        personaId: string,
    ): Promise<number> {
        // Check if user has premium
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription || subscription.status !== 'ACTIVE') {
            return 0; // Don't extract for free users
        }

        // Get recent messages (last 10)
        const messages = await this.prisma.message.findMany({
            where: {
                conversationId,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        if (messages.length === 0) {
            return 0;
        }

        // Simple extraction logic (can be enhanced with AI)
        const extractedMemories: Array<{
            type: MemoryType;
            content: string;
            importance: number;
        }> = [];

        // Look for preferences
        const preferenceKeywords = ['prefer', 'like', 'love', 'favorite', 'enjoy'];
        const factKeywords = ['am', 'work', 'live', 'study', 'major'];
        const eventKeywords = ['went to', 'visited', 'traveled', 'celebrated'];

        for (const message of messages) {
            if (message.sender !== 'USER') continue;

            const content = message.content.toLowerCase();

            // Check for preferences
            if (preferenceKeywords.some((kw) => content.includes(kw))) {
                extractedMemories.push({
                    type: MemoryType.PREFERENCE,
                    content: message.content,
                    importance: 5,
                });
            }

            // Check for facts
            if (factKeywords.some((kw) => content.includes(kw))) {
                extractedMemories.push({
                    type: MemoryType.FACT,
                    content: message.content,
                    importance: 7,
                });
            }

            // Check for events
            if (eventKeywords.some((kw) => content.includes(kw))) {
                extractedMemories.push({
                    type: MemoryType.EVENT,
                    content: message.content,
                    importance: 6,
                });
            }
        }

        // Store extracted memories
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
            } catch (error) {
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

    /**
     * Get all memories for user (for UI display)
     */
    async getUserMemories(userId: string, personaId?: string): Promise<Memory[]> {
        const where: any = { userId };
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

        // Cast Prisma's string type to MemoryType enum
        return memories.map(m => ({
            ...m,
            type: m.type as MemoryType,
        }));
    }

    /**
     * Delete specific memory (user privacy control)
     */
    async deleteMemory(memoryId: string, userId: string): Promise<boolean> {
        try {
            await this.prisma.memory.deleteMany({
                where: {
                    id: memoryId,
                    userId, // Ensure user owns this memory
                },
            });

            console.log('[MEMORY] Deleted:', { memoryId, userId });
            return true;
        } catch (error) {
            console.error('[MEMORY] Delete failed:', error.message);
            return false;
        }
    }

    /**
     * Delete all memories for user (GDPR compliance)
     */
    async deleteAllUserMemories(userId: string): Promise<number> {
        const result = await this.prisma.memory.deleteMany({
            where: { userId },
        });

        console.log('[MEMORY] Deleted all for user:', {
            userId,
            count: result.count,
        });

        return result.count;
    }

    /**
     * Format memories for AI context
     */
    formatMemoriesForContext(memories: Memory[]): string {
        if (memories.length === 0) {
            return '';
        }

        const formattedMemories = memories
            .map((m) => `- ${m.type}: ${m.content}`)
            .join('\n');

        return `\nRemembered about this user:\n${formattedMemories}\n`;
    }

    /**
     * Get memory statistics
     */
    async getMemoryStats(userId: string): Promise<{
        totalMemories: number;
        byType: Record<MemoryType, number>;
        hasPremium: boolean;
    }> {
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
            [MemoryType.PREFERENCE]: memories.filter(
                (m) => m.type === MemoryType.PREFERENCE,
            ).length,
            [MemoryType.EVENT]: memories.filter((m) => m.type === MemoryType.EVENT)
                .length,
        };

        return {
            totalMemories: memories.length,
            byType,
            hasPremium: true,
        };
    }
}
