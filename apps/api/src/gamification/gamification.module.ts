import { Module } from '@nestjs/common';
import { DailyRewardService } from './daily-reward.service';
import { GamificationController } from './gamification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CoinModule } from '../coin/coin.module';

@Module({
    imports: [PrismaModule, CoinModule],
    controllers: [GamificationController],
    providers: [DailyRewardService],
    exports: [DailyRewardService],
})
export class GamificationModule { }
