import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    startConversation(req: any, body: {
        personaId: string;
    }): Promise<{
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
    sendMessage(req: any, body: {
        personaId: string;
        message: string;
    }): Promise<{
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
    sendGift(req: any, body: {
        personaId: string;
        giftId: string;
        amount: number;
    }): Promise<{
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
}
