import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { LLMService } from '../llm/llm.service';
import { CoinService } from '../coin/coin.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private chatService: ChatService,
        private llmService: LLMService,
        private coinService: CoinService,
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { conversationId: string; content: string; sender: 'USER' | 'CREATOR'; personaId?: string; userId?: string; creatorUserId?: string },
        @ConnectedSocket() client: Socket
    ) {
        console.log('Received message:', data);

        // If user message, check and deduct coins
        if (data.sender === 'USER' && data.userId) {
            const coinCost = 2; // Cost per message
            const success = await this.coinService.deductCoins(
                data.userId,
                coinCost,
                'Message sent to AI persona',
                { conversationId: data.conversationId, personaId: data.personaId }
            );

            if (!success) {
                // Insufficient balance
                client.emit('error', { message: 'Insufficient coins. Please purchase more.' });
                return;
            }

            // Add coins to creator's earnings
            if (data.creatorUserId) {
                await this.coinService.addCreatorEarnings(
                    data.creatorUserId,
                    coinCost,
                    { conversationId: data.conversationId }
                );
            }
        }

        // Save user message
        await this.chatService.saveMessage(data.conversationId, data.content, data.sender);

        // Broadcast user message
        this.server.to(data.conversationId).emit('newMessage', {
            ...data,
            timestamp: new Date(),
        });

        // If user message, generate AI response
        if (data.sender === 'USER' && data.personaId) {
            try {
                // Get conversation history
                const history = await this.chatService.getMessages(data.conversationId);
                const conversationHistory = history.slice(-5).map(msg => ({
                    sender: msg.sender,
                    content: msg.content,
                }));

                // Generate AI response
                const { content: aiResponse } = await this.llmService.generatePersonaResponse(
                    data.personaId,
                    data.content,
                    conversationHistory,
                );

                // Save AI response
                await this.chatService.saveMessage(data.conversationId, aiResponse, 'CREATOR');

                // Broadcast AI response
                this.server.to(data.conversationId).emit('newMessage', {
                    conversationId: data.conversationId,
                    content: aiResponse,
                    sender: 'CREATOR',
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Error generating AI response:', error);
                // Send error message
                this.server.to(data.conversationId).emit('newMessage', {
                    conversationId: data.conversationId,
                    content: 'Sorry, I encountered an error. Please try again.',
                    sender: 'CREATOR',
                    timestamp: new Date(),
                });
            }
        }

        return data;
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);
        client.emit('joinedRoom', room);
    }
}
