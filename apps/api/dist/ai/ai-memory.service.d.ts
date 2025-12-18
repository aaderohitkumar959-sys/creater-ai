import { PrismaService } from '../prisma/prisma.service';
export declare enum MemoryType {
    FACT = "FACT",
    PREFERENCE = "PREFERENCE",
    EVENT = "EVENT"
}
interface Memory {
    id: string;
    userId: string;
    personaId: string;
    type: MemoryType;
    content: string;
    importance: number;
    createdAt: Date;
    lastAccessedAt: Date;
}
export declare class AIMemoryService {
    private prisma;
    constructor(prisma: PrismaService);
    getShortTermMemory(conversationId: string): Promise<Array<{
        sender: string;
        content: string;
    }>>;
    getLongTermMemories(userId: string, personaId: string, limit?: number): Promise<Memory[]>;
    extractMemoriesFromConversation(conversationId: string, userId: string, personaId: string): Promise<number>;
    getUserMemories(userId: string, personaId?: string): Promise<Memory[]>;
    deleteMemory(memoryId: string, userId: string): Promise<boolean>;
    deleteAllUserMemories(userId: string): Promise<number>;
    formatMemoriesForContext(memories: Memory[]): string;
    getMemoryStats(userId: string): Promise<{
        totalMemories: number;
        byType: Record<MemoryType, number>;
        hasPremium: boolean;
    }>;
}
export {};
