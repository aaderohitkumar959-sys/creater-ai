import { DailyRewardService } from './daily-reward.service';
export declare class GamificationController {
    private dailyRewardService;
    constructor(dailyRewardService: DailyRewardService);
    claimDailyReward(req: any): Promise<{
        success: boolean;
        message: string;
        nextRewardAt: Date;
        currentStreak: number;
        coinsGranted?: undefined;
        bonusMultiplier?: undefined;
    } | {
        success: boolean;
        message: string;
        coinsGranted: number;
        currentStreak: number;
        bonusMultiplier: number;
        nextRewardAt: Date;
    }>;
    getDailyRewardStatus(req: any): Promise<{
        canClaim: boolean;
        currentStreak: number;
        nextRewardAt: Date | null;
        potentialReward: number;
    }>;
    getStreakCalendar(req: any): Promise<{
        days: Array<{
            date: string;
            claimed: boolean;
            dayNumber: number;
        }>;
        currentStreak: number;
    }>;
}
