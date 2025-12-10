import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CoinModule } from '../coin/coin.module';

@Module({
  imports: [PrismaModule, CoinModule],
  controllers: [QuestController],
  providers: [QuestService],
})
export class QuestModule {}
