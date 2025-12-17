import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoinService } from '../coin/coin.service';

interface DailyRewardResult {
    claimed: boolean;
    coinsGranted: number;
    currentStreak: number;
    bonusMultiplier: number;
    nextRewardAt: Date;
}

@Injectable()
export class DailyRewardService {
    constructor(
        private prisma: PrismaService,
        private coinService: CoinService,
    ) { }

    /**
     * Claim daily reward with streak multiplier
     * Base: 10 coins
     * 7-day streak: 2x bonus (20 coins total)
     * 30-day streak: 3x bonus (30 coins total)
     */
    async claimDailyReward(userId: string): Promise<DailyRewardResult> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const now = new Date();
        const today = this.getDateString(now);
        const lastClaim = user.lastDailyRewardClaimed
            ? this.getDateString(user.lastDailyRewardClaimed)
            : null;

        // Check if already claimed today
        if (lastClaim === today) {
            const nextReward = new Date(now);
            nextReward.setDate(nextReward.getDate() + 1);
            nextReward.setHours(0, 0, 0, 0);

            return {
                claimed: false,
                coinsGranted: 0,
                currentStreak: user.loginStreak || 0,
                bonusMultiplier: this.getBonusMultiplier(user.loginStreak || 0),
                nextRewardAt: nextReward,
            };
        }

        // Calculate streak
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);

        let newStreak: number;
        if (lastClaim === yesterdayStr) {
            // Continuing streak
            newStreak = (user.loginStreak || 0) + 1;
        } else if (lastClaim === null) {
            // First time claim
            newStreak = 1;
        } else {
            // Streak broken
            newStreak = 1;
        }

        // Calculate bonus
        const bonusMultiplier = this.getBonusMultiplier(newStreak);
        const baseReward = 10;
        const totalCoins = Math.floor(baseReward * bonusMultiplier);

        // Update user streak
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loginStreak: newStreak,
                lastDailyRewardClaimed: now,
            },
        });

        // Grant coins
        await this.coinService.addCoins(
            userId,
            totalCoins,
            `Daily reward (Day ${newStreak})`,
            {
                streak: newStreak,
                baseReward,
                bonusMultiplier,
                totalCoins,
            },
        );

        console.log('[DAILY_REWARD] Claimed:', {
            userId,
            streak: newStreak,
            coins: totalCoins,
            multiplier: bonusMultiplier,
        });

        const nextReward = new Date(now);
        nextReward.setDate(nextReward.getDate() + 1);
        nextReward.setHours(0, 0, 0, 0);

        return {
            claimed: true,
            coinsGranted: totalCoins,
            currentStreak: newStreak,
            bonusMultiplier,
            nextRewardAt: nextReward,
        };
    }

    /**
     * Check if user can claim today
     */
    async canClaimToday(userId: string): Promise<{
        canClaim: boolean;
        currentStreak: number;
        nextRewardAt: Date | null;
        potentialReward: number;
    }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const now = new Date();
        const today = this.getDateString(now);
        const lastClaim = user.lastDailyRewardClaimed
            ? this.getDateString(user.lastDailyRewardClaimed)
            : null;

        const canClaim = lastClaim !== today;
        const currentStreak = user.loginStreak || 0;

        // Calculate potential streak
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);

        let potentialStreak: number;
        if (canClaim) {
            if (lastClaim === yesterdayStr) {
                potentialStreak = currentStreak + 1;
            } else {
                potentialStreak = 1;
            }
        } else {
            potentialStreak = currentStreak;
        }

        const bonusMultiplier = this.getBonusMultiplier(potentialStreak);
        const potentialReward = Math.floor(10 * bonusMultiplier);

        let nextRewardAt: Date | null = null;
        if (!canClaim) {
            nextRewardAt = new Date(now);
            nextRewardAt.setDate(nextRewardAt.getDate() + 1);
            nextRewardAt.setHours(0, 0, 0, 0);
        }

        return {
            canClaim,
            currentStreak,
            nextRewardAt,
            potentialReward,
        };
    }

    /**
     * Get login streak calendar (last 7 days)
     */
    async getStreakCalendar(userId: string): Promise<{
        days: Array<{ date: string; claimed: boolean; dayNumber: number }>;
        currentStreak: number;
    }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const now = new Date();
        const currentStreak = user.loginStreak || 0;
        const lastClaim = user.lastDailyRewardClaimed;

        const calendar: Array<{ date: string; claimed: boolean; dayNumber: number }> = []; // Explicitly type
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = this.getDateString(date);

            let claimed = false;
            if (lastClaim && currentStreak > 0) {
                // Check if this date is within the streak
                const daysSinceLastClaim = Math.floor(
                    (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24),
                );
                const streakStart = new Date(lastClaim);
                streakStart.setDate(streakStart.getDate() - (currentStreak - 1));

                claimed = date >= streakStart && date <= lastClaim;
            }

            calendar.push({
                date: dateStr,
                claimed,
                dayNumber: 7 - i,
            });
        }

        return {
            days: calendar,
            currentStreak,
        };
    }

    /**
     * Get bonus multiplier based on streak
     */
    private getBonusMultiplier(streak: number): number {
        if (streak >= 30) return 3; // 3x for 30-day streak
        if (streak >= 7) return 2; // 2x for 7-day streak
        return 1; // 1x base
    }

    /**
     * Get date string in YYYY-MM-DD format
     */
    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Reset streak (admin function or if user explicitly requests)
     */
    async resetStreak(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loginStreak: 0,
                lastDailyRewardClaimed: null,
            },
        });

        console.log('[DAILY_REWARD] Streak reset for user:', userId);
    }
}
