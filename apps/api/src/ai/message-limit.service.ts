import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import { SubscriptionService } from '../subscription/subscription.service';
import * as admin from 'firebase-admin';

@Injectable()
export class MessageLimitService {
    private readonly FREE_TIER_DAILY_LIMIT = 100;
    private readonly PREMIUM_TIER_DAILY_LIMIT = 500;

    constructor(
        private firestore: FirestoreService,
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
        const hasPremium = await this.subscriptionService.hasPremiumAccess(userId);
        const limit = hasPremium ? this.PREMIUM_TIER_DAILY_LIMIT : this.FREE_TIER_DAILY_LIMIT;

        const user = await this.firestore.findUnique('users', userId) as any;
        if (!user) throw new Error('User not found');

        const today = this.getDateString(new Date());
        const lastMsgDateDoc = user.lastMessageDate?.toDate ? user.lastMessageDate.toDate() : user.lastMessageDate;
        const lastMessageDate = lastMsgDateDoc ? this.getDateString(new Date(lastMsgDateDoc)) : null;

        let currentCount = 0;
        if (lastMessageDate === today) {
            currentCount = user.dailyMessageCount || 0;
        }

        const resetsAt = new Date();
        resetsAt.setDate(resetsAt.getDate() + 1);
        resetsAt.setHours(0, 0, 0, 0);

        const remaining = Math.max(0, limit - currentCount);
        const allowed = currentCount < limit;

        return { allowed, remaining, limit, resetsAt };
    }

    /**
     * Increment message count for user
     */
    async incrementMessageCount(userId: string): Promise<void> {
        const today = new Date();
        const todayString = this.getDateString(today);

        const user = await this.firestore.findUnique('users', userId) as any;
        if (!user) throw new Error('User not found');

        const lastMsgDateDoc = user.lastMessageDate?.toDate ? user.lastMessageDate.toDate() : user.lastMessageDate;
        const lastMessageDate = lastMsgDateDoc ? this.getDateString(new Date(lastMsgDateDoc)) : null;

        if (lastMessageDate !== todayString) {
            await this.firestore.update('users', userId, {
                dailyMessageCount: 1,
                lastMessageDate: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            await this.firestore.update('users', userId, {
                dailyMessageCount: admin.firestore.FieldValue.increment(1),
            });
        }
    }

    /**
     * Get usage statistics
     */
    async getUsageStats(userId: string) {
        const stats = await this.canSendMessage(userId);
        return {
            todayCount: stats.limit - stats.remaining,
            limit: stats.limit,
            percentageUsed: Math.round(((stats.limit - stats.remaining) / stats.limit) * 100),
            tier: stats.limit > this.FREE_TIER_DAILY_LIMIT ? 'PREMIUM' : 'FREE',
        };
    }

    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
