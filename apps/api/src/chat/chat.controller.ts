import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @UseGuards(JwtAuthGuard)
    @Post('conversation')
    async startConversation(@Request() req, @Body() body: { personaId: string }) {
        return this.chatService.createConversation(req.user.userId, body.personaId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversation/:id/messages')
    async getMessages(@Param('id') conversationId: string) {
        return this.chatService.getMessages(conversationId);
    }
}
