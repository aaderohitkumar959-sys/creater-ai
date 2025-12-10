import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('conversation')
  async startConversation(@Request() req, @Body() body: { personaId: string }) {
    return this.chatService.createConversation(req.user.userId, body.personaId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(
    @Request() req,
    @Body() body: { personaId: string; message: string },
  ) {
    return this.chatService.sendMessage(
      req.user.userId,
      body.personaId,
      body.message,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('gift')
  async sendGift(
    @Request() req,
    @Body() body: { personaId: string; giftId: string; amount: number },
  ) {
    return this.chatService.sendGift(
      req.user.userId,
      body.personaId,
      body.giftId,
      body.amount,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }
}
