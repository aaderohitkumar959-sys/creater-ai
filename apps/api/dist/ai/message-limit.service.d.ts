import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
export declare class MessageLimitService {
    private prisma;
    private subscriptionService;
    private readonly FREE_TIER_DAILY_LIMIT;
    private readonly PREMIUM_TIER_DAILY_LIMIT;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService);
    canSendMessage(userId: string): Promise<{
        allowed: boolean;
        remaining: number;
        limit: number;
        resetsAt: Date;
    }>;
    incrementMessageCount(userId: string): Promise<void>;
    getUsageStats(userId: string): Promise<{
        todayCount: number;
        limit: number;
        percentageUsed: number;
        tier: 'FREE' | 'PREMIUM';
    }>;
    resetDailyCounts(): Promise<number>;
    private getDateString;
}
