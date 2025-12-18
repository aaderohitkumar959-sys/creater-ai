import { PrismaService } from '../prisma/prisma.service';
import { CoinService } from '../coin/coin.service';
export declare class QuestService {
    private prisma;
    private coinService;
    constructor(prisma: PrismaService, coinService: CoinService);
    getDailyStatus(userId: string): Promise<{
        streak: number;
        canClaim: boolean;
        rewardAmount: number;
    }>;
    claimDailyReward(userId: string): Promise<{
        streak: number;
        reward: number;
        message: string;
    }>;
    private calculateReward;
}
