import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [ModerationService],
    controllers: [ModerationController],
    exports: [ModerationService],
})
export class ModerationModule { }
