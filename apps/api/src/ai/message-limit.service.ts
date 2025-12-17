import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class MessageLimitService {
    private readonly FREE_TIER_DAILY_LIMIT = 100;
    private readonly PREMIUM_TIER_DAILY_LIMIT = 500;

    constructor(
        private prisma: PrismaService,
        private subscriptionService: SubscriptionService,
    ) { }

    /**
     * Check if user can send message (daily limit)
     */
    async canSendMessage(userId: string): Promise<{
        allowed: boolean;
        remaining: number;
        limit: number;
        resetsAt: Date;
    }> {
        // Get user subscription
        const hasPremium = await this.subscriptionService.hasPremiumAccess(userId);
        const limit = hasPremium
            ? this.PREMIUM_TIER_DAILY_LIMIT
            : this.FREE_TIER_DAILY_LIMIT;

        // Get user's daily message count
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                dailyMessageCount: true,
                lastMessageDate: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const today = this.getDateString(new Date());
        const lastMessageDate = user.lastMessageDate
            ? this.getDateString(user.lastMessageDate)
            : null;

        // Reset count if new day
        let currentCount = 0;
        if (lastMessageDate === today) {
            currentCount = user.dailyMessageCount || 0;
        }

        // Calculate next reset time
        const resetsAt = new Date();
        resetsAt.setDate(resetsAt.getDate() + 1);
        resetsAt.setHours(0, 0, 0, 0);

        const remaining = Math.max(0, limit - currentCount);
        const allowed = currentCount < limit;

        return {
            allowed,
            remaining,
            limit,
            resetsAt,
        };
    }

    /**
     * Increment message count for user
     */
    async incrementMessageCount(userId: string): Promise<void> {
        const today = new Date();
        const todayString = this.getDateString(today);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const lastMessageDate = user.lastMessageDate
            ? this.getDateString(user.lastMessageDate)
            : null;

        // Reset if new day, otherwise increment
        if (lastMessageDate !== todayString) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: 1,
                    lastMessageDate: today,
                },
            });
        } else {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: { increment: 1 },
                },
            });
        }

        console.log('[MESSAGE_LIMIT] Incremented count for user:', userId);
    }

    /**
     * Get usage statistics
     */
    async getUsageStats(userId: string): Promise<{
        todayCount: number;
        limit: number;
        percentageUsed: number;
        tier: 'FREE' | 'PREMIUM';
    }> {
        const hasPremium = await this.subscriptionService.hasPremiumAccess(userId);
        const limit = hasPremium
            ? this.PREMIUM_TIER_DAILY_LIMIT
            : this.FREE_TIER_DAILY_LIMIT;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        const today = this.getDateString(new Date());
        const lastMessageDate = user.lastMessageDate
            ? this.getDateString(user.lastMessageDate)
            : null;

        const todayCount =
            lastMessageDate === today ? user.dailyMessageCount || 0 : 0;

        return {
            todayCount,
            limit,
            percentageUsed: Math.round((todayCount / limit) * 100),
            tier: hasPremium ? 'PREMIUM' : 'FREE',
        };
    }

    /**
     * Reset all user counts (admin function, runs daily at midnight)
     */
    async resetDailyCounts(): Promise<number> {
        const result = await this.prisma.user.updateMany({
            data: {
                dailyMessageCount: 0,
            },
        });

        console.log('[MESSAGE_LIMIT] Reset daily counts for all users');
        return result.count;
    }

    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
