import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CreatorModule } from './creator/creator.module';
import { PaymentModule } from './payment/payment.module';
import { CoinModule } from './coin/coin.module';
import { LLMModule } from './llm/llm.module';
import { ChatModule } from './chat/chat.module';
import { ModerationModule } from './moderation/moderation.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PersonaModule } from './persona/persona.module';
import { MeterModule } from './meter/meter.module';
import { NotificationModule } from './notification/notification.module';
import { QuestModule } from './quest/quest.module';
import { GamificationModule } from './gamification/gamification.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    CreatorModule,
    PaymentModule,
    CoinModule,
    LLMModule,
    ChatModule,
    ModerationModule,
    AdminModule,
    AnalyticsModule,
    PersonaModule,
    MeterModule,
    NotificationModule,
    QuestModule,
    GamificationModule,
    SubscriptionModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
