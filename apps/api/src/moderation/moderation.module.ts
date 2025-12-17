import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ModerationService, ReportService],
  controllers: [ModerationController, ReportController],
  exports: [ModerationService, ReportService],
})
export class ModerationModule { }
