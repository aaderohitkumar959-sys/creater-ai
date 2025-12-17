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
import { ModerationService } from '../moderation/moderation.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // FIXED: No wildcard
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private llmService: LLMService,
    private coinService: CoinService,
    private moderationService: ModerationService, // NEW: Content moderation
  ) { }

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
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
    console.log('[CHAT] Received message:', {
      conversationId: data.conversationId,
      sender: data.sender,
      contentLength: data.content?.length || 0,
    });

    // PHASE 1: Handle user messages
    if (data.sender === 'USER' && data.userId) {
      const coinCost = 2; // Cost per message

      // Step 1: Moderate user message BEFORE processing
      const moderationResult = await this.moderationService.moderateContent(
        data.content,
      );

      if (moderationResult.blocked) {
        console.warn('[MODERATION] User message blocked:', {
          userId: data.userId,
          reason: moderationResult.reason,
          severity: moderationResult.severity,
        });

        client.emit('messageBlocked', {
          message: this.moderationService.getUserMessage(moderationResult),
          reason: moderationResult.reason,
        });
        return;
      }

      // Step 2: Check balance (READ ONLY - don't deduct yet)
      const balance = await this.coinService.getBalance(data.userId);

      if (balance < coinCost) {
        client.emit('error', {
          message: 'Insufficient coins. Please purchase more.',
          balance,
          required: coinCost,
        });
        return;
      }

      // Step 3: Save user message (approved by moderation)
      await this.chatService.saveMessage(
        data.conversationId,
        data.content,
        data.sender,
      );

      // Step 4: Broadcast user message
      this.server.to(data.conversationId).emit('newMessage', {
        ...data,
        timestamp: new Date(),
      });

      // Step 5: Generate AI response
      if (data.personaId) {
        try {
          // Get conversation history
          const history = await this.chatService.getMessages(
            data.conversationId,
          );
          const conversationHistory = history.slice(-5).map((msg) => ({
            sender: msg.sender,
            content: msg.content,
          }));

          console.log('[AI] Generating response for persona:', data.personaId);

          // Generate AI response
          const { content: aiResponse } =
            await this.llmService.generatePersonaResponse(
              data.personaId,
              data.content,
              conversationHistory,
            );

          console.log('[AI] Response generated:', {
            personaId: data.personaId,
            responseLength: aiResponse.length,
          });

          // Step 6: Moderate AI response
          const aiModeration = await this.moderationService.moderateContent(
            aiResponse,
          );

          if (aiModeration.blocked) {
            console.error('[MODERATION] AI response blocked:', {
              personaId: data.personaId,
              reason: aiModeration.reason,
              severity: aiModeration.severity,
            });

            // Use safe fallback message
            const fallbackResponse =
              "I need to rephrase that. Let's talk about something else! ✨";

            await this.chatService.saveMessage(
              data.conversationId,
              fallbackResponse,
              'CREATOR',
            );

            this.server.to(data.conversationId).emit('newMessage', {
              conversationId: data.conversationId,
              content: fallbackResponse,
              sender: 'CREATOR',
              timestamp: new Date(),
            });

            // CRITICAL: Deduct coins even for fallback (AI was called)
            await this.coinService.deductCoins(
              data.userId,
              coinCost,
              'Message sent to AI persona',
              {
                conversationId: data.conversationId,
                personaId: data.personaId,
                moderationBlocked: true,
              },
            );

            return;
          }

          // Step 7: AI response is safe → Save it
          await this.chatService.saveMessage(
            data.conversationId,
            aiResponse,
            'CREATOR',
          );

          // Step 8: Broadcast AI response
          this.server.to(data.conversationId).emit('newMessage', {
            conversationId: data.conversationId,
            content: aiResponse,
            sender: 'CREATOR',
            timestamp: new Date(),
          });

          // Step 9: ONLY NOW deduct coins (AI succeeded)
          const deducted = await this.coinService.deductCoins(
            data.userId,
            coinCost,
            'Message sent to AI persona',
            { conversationId: data.conversationId, personaId: data.personaId },
          );

          if (!deducted) {
            console.error('[COIN] Failed to deduct coins after AI response', {
              userId: data.userId,
              balance,
            });
            // This shouldn't happen (we checked balance), but log it
          }

          // Step 10: Remove creator earnings (user-only platform)
          // DEPRECATED: No longer needed since all personas are platform-owned
          // if (data.creatorUserId) { ... }

          console.log('[CHAT] Message flow completed successfully');
        } catch (error) {
          console.error('[AI ERROR] Failed to generate AI response:', {
            error: error.message,
            stack: error.stack,
            personaId: data.personaId,
            userId: data.userId,
          });

          // Send friendly error message
          this.server.to(data.conversationId).emit('newMessage', {
            conversationId: data.conversationId,
            content:
              "I'm having trouble responding right now. Please try again in a moment! 🔄",
            sender: 'CREATOR',
            timestamp: new Date(),
            isError: true,
          });

          client.emit('chatError', {
            message: 'AI service unavailable',
            canRetry: true,
          });

          // CRITICAL: Do NOT deduct coins if AI failed
          console.log('[COIN] No coins deducted due to AI failure');
        }
      }
    }

    return { success: true };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    console.log(`[WS] Client ${client.id} joined room ${room}`);
    client.emit('joinedRoom', room);
  }
}
