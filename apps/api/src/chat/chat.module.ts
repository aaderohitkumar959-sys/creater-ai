import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatStreamController } from './chat-stream.controller';
import { LLMModule } from '../llm/llm.module';
import { ModerationModule } from '../moderation/moderation.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [LLMModule, ModerationModule, AnalyticsModule],
    controllers: [ChatController, ChatStreamController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
