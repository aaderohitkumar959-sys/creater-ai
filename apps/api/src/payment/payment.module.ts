import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CoinModule } from '../coin/coin.module';
import { AnalyticsModule } from '../analytics/analytics.module';

import { RedemptionService } from './redemption.service';

@Module({
  imports: [CoinModule, AnalyticsModule],
  providers: [PaymentService, RedemptionService],
  controllers: [PaymentController],
  exports: [PaymentService, RedemptionService],
})
export class PaymentModule { }
