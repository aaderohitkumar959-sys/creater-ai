import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { DailyRewardService } from './daily-reward.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
    constructor(private dailyRewardService: DailyRewardService) { }

    /**
     * Claim daily reward
     */
    @Post('daily-reward/claim')
    async claimDailyReward(@Req() req: any) {
        const userId = req.user.id;
        const result = await this.dailyRewardService.claimDailyReward(userId);

        if (!result.claimed) {
            return {
                success: false,
                message: 'You have already claimed your daily reward today',
                nextRewardAt: result.nextRewardAt,
                currentStreak: result.currentStreak,
            };
        }

        return {
            success: true,
            message: `You earned ${result.coinsGranted} coins! ${result.bonusMultiplier > 1 ? `${result.bonusMultiplier}x streak bonus!` : ''}`,
            coinsGranted: result.coinsGranted,
            currentStreak: result.currentStreak,
            bonusMultiplier: result.bonusMultiplier,
            nextRewardAt: result.nextRewardAt,
        };
    }

    /**
     * Check if user can claim today
     */
    @Get('daily-reward/status')
    async getDailyRewardStatus(@Req() req: any) {
        const userId = req.user.id;
        return await this.dailyRewardService.canClaimToday(userId);
    }

    /**
     * Get login streak calendar
     */
    @Get('daily-reward/calendar')
    async getStreakCalendar(@Req() req: any) {
        const userId = req.user.id;
        return await this.dailyRewardService.getStreakCalendar(userId);
    }
}
