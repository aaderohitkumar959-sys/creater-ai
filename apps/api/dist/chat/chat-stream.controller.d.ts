import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
export declare class ChatStreamController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(req: any, body: {
        personaId: string;
        message: string;
    }): Promise<{
        message: {
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
    }>;
    streamMessage(req: any, personaId: string, message: string, userId: string): Observable<MessageEvent>;
}
