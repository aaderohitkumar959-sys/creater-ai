import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { LLMService } from '../llm/llm.service';
import { CoinService } from '../coin/coin.service';
import { ModerationService } from '../moderation/moderation.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    private llmService;
    private coinService;
    private moderationService;
    server: Server;
    constructor(chatService: ChatService, llmService: LLMService, coinService: CoinService, moderationService: ModerationService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(data: {
        conversationId: string;
        content: string;
        sender: 'USER' | 'CREATOR';
        personaId?: string;
        userId?: string;
        creatorUserId?: string;
    }, client: Socket): Promise<{
        success: boolean;
    } | undefined>;
    handleJoinRoom(room: string, client: Socket): void;
}
