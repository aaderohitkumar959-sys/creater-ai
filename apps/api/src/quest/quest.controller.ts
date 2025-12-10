import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @UseGuards(JwtAuthGuard)
  @Get('daily')
  async getDailyStatus(@Request() req) {
    return this.questService.getDailyStatus(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('daily/claim')
  async claimDailyReward(@Request() req) {
    return this.questService.claimDailyReward(req.user.userId);
  }
}
