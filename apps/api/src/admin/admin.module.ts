import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AnalyticsModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule { }
