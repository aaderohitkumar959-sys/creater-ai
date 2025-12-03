import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [AnalyticsModule],
    controllers: [AdminController],
})
export class AdminModule { }
