import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from '../llm/llm.service';
import { ModerationService } from '../moderation/moderation.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MeteredService } from '../meter/meter.service';
export declare class ChatService {
    private prisma;
    private llm;
    private moderation;
    private analytics;
    private meteredService;
    constructor(prisma: PrismaService, llm: LLMService, moderation: ModerationService, analytics: AnalyticsService, meteredService: MeteredService);
    saveMessage(conversationId: string, content: string, sender: 'USER' | 'CREATOR'): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        content: string;
        sender: import(".prisma/client").$Enums.Role;
        coinCost: number;
        isDeleted: boolean;
        conversationId: string;
    }>;
    getMessages(conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        content: string;
        sender: import(".prisma/client").$Enums.Role;
        coinCost: number;
        isDeleted: boolean;
        conversationId: string;
    }[]>;
    createConversation(userId: string, personaId: string): Promise<{
        persona: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            description: string | null;
            category: string | null;
            isFeatured: boolean;
            defaultCoinCost: number;
            personality: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        personaId: string;
    }>;
    sendMessage(userId: string, personaId: string, message: string): Promise<{
        userMessage: {
            id: string;
            createdAt: Date;
            userId: string | null;
            content: string;
            sender: import(".prisma/client").$Enums.Role;
            coinCost: number;
            isDeleted: boolean;
            conversationId: string;
        };
        aiMessage: {
            id: string;
            createdAt: Date;
            userId: string | null;
            content: string;
            sender: import(".prisma/client").$Enums.Role;
            coinCost: number;
            isDeleted: boolean;
            conversationId: string;
        };
        tokensUsed: number;
        model: string;
        remainingMessages: number;
    }>;
    streamMessage(userId: string, personaId: string, message: string): AsyncGenerator<{
        type: 'chunk' | 'complete' | 'error';
        content?: string;
        messageId?: string;
        tokensUsed?: number;
        message?: string;
        remainingMessages?: number;
    }>;
    sendGift(userId: string, personaId: string, giftId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        content: string;
        sender: import(".prisma/client").$Enums.Role;
        coinCost: number;
        isDeleted: boolean;
        conversationId: string;
    }>;
}
