import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Sse,
  MessageEvent,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatStreamController {
  constructor(private readonly chatService: ChatService) { }



  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 chats per minute
  @Sse('stream')
  streamMessage(
    @Req() req,
    @Query('personaId') personaId: string,
    @Query('message') message: string,
    @Query('userId') userId: string,
  ): Observable<MessageEvent> {
    console.log(
      `SSE Request received: personaId=${personaId}, userId=${userId}, message=${message}`,
    );

    return new Observable((observer) => {
      // Handle client disconnect
      req.on('close', () => {
        console.log(`Client disconnected for user ${userId}`);
        // The generator loop below will naturally stop if observer is unsubscribed,
        // but we can also explicitly complete if needed, though usually not required with Observable.
      });

      (async () => {
        try {
          console.log('Starting stream generation...');
          for await (const chunk of this.chatService.streamMessage(
            userId,
            personaId,
            message,
          )) {
            if (observer.closed) {
              console.log('Observer closed, stopping stream');
              break;
            }
            console.log('Sending chunk:', chunk.type);
            // Always send JSON-formatted SSE messages
            observer.next({
              data: JSON.stringify(chunk),
            } as MessageEvent);
          }
          if (!observer.closed) {
            console.log('Stream complete');
            observer.complete();
          }
        } catch (error) {
          console.error('Stream error in controller:', error);
          if (!observer.closed) {
            // Send error as JSON instead of raw error object
            observer.next({
              data: JSON.stringify({
                type: 'error',
                message: error?.message || 'An unexpected error occurred',
              }),
            } as MessageEvent);
            observer.complete();
          }
        }
      })();
    });
  }
}
