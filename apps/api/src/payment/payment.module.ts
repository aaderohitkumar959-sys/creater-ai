import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CoinModule } from '../coin/coin.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [CoinModule, AnalyticsModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
