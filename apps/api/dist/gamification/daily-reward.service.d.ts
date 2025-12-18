import { PrismaService } from '../prisma/prisma.service';
import { CoinService } from '../coin/coin.service';
interface DailyRewardResult {
    claimed: boolean;
    coinsGranted: number;
    currentStreak: number;
    bonusMultiplier: number;
    nextRewardAt: Date;
}
export declare class DailyRewardService {
    private prisma;
    private coinService;
    constructor(prisma: PrismaService, coinService: CoinService);
    claimDailyReward(userId: string): Promise<DailyRewardResult>;
    canClaimToday(userId: string): Promise<{
        canClaim: boolean;
        currentStreak: number;
        nextRewardAt: Date | null;
        potentialReward: number;
    }>;
    getStreakCalendar(userId: string): Promise<{
        days: Array<{
            date: string;
            claimed: boolean;
            dayNumber: number;
        }>;
        currentStreak: number;
    }>;
    private getBonusMultiplier;
    private getDateString;
    resetStreak(userId: string): Promise<void>;
}
export {};
