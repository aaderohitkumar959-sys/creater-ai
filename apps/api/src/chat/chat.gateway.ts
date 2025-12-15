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
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      sender: 'USER' | 'CREATOR';
      personaId?: string;
      userId?: string;
      creatorUserId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Received message:', data);

    // If user message, check and deduct coins
    if (data.sender === 'USER' && data.userId) {
      const coinCost = 2; // Cost per message
      const success = await this.coinService.deductCoins(
        data.userId,
        coinCost,
        'Message sent to AI persona',
        { conversationId: data.conversationId, personaId: data.personaId },
      );

      if (!success) {
        // Insufficient balance
        client.emit('error', {
          message: 'Insufficient coins. Please purchase more.',
        });
        return;
      }

      // Add coins to creator's earnings
      if (data.creatorUserId) {
        await this.coinService.addCreatorEarnings(
          data.creatorUserId,
          coinCost,
          { conversationId: data.conversationId },
        );
      }
    }

    // Save user message
    await this.chatService.saveMessage(
      data.conversationId,
      data.content,
      data.sender,
    );

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
        const conversationHistory = history.slice(-5).map((msg) => ({
          sender: msg.sender,
          content: msg.content,
        }));

        console.log('[CHAT] Generating AI response for persona:', data.personaId);

        // Generate AI response with timeout
        const { content: aiResponse } =
          await this.llmService.generatePersonaResponse(
            data.personaId,
            data.content,
            conversationHistory,
          );

        console.log('[CHAT SUCCESS] AI response generated:', {
          personaId: data.personaId,
          responseLength: aiResponse.length,
        });

        // Save AI response
        await this.chatService.saveMessage(
          data.conversationId,
          aiResponse,
          'CREATOR',
        );

        // Broadcast AI response
        this.server.to(data.conversationId).emit('newMessage', {
          conversationId: data.conversationId,
          content: aiResponse,
          sender: 'CREATOR',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('[CHAT ERROR] Failed to generate AI response:', {
          error: error.message,
          stack: error.stack,
          personaId: data.personaId,
          userId: data.userId,
          conversationId: data.conversationId,
          messageLength: data.content.length,
        });

        // Send friendly error message to user
        this.server.to(data.conversationId).emit('newMessage', {
          conversationId: data.conversationId,
          content: "I'm having trouble responding right now. Please try again in a moment! 🔄",
          sender: 'CREATOR',
          timestamp: new Date(),
          isError: true,
        });

        // Also emit an error event for frontend to handle
        client.emit('chatError', {
          message: 'AI response failed',
          canRetry: true,
        });
      }
    }

    return data;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
    client.emit('joinedRoom', room);
  }
}
