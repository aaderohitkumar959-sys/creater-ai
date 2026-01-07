import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import { CoinService } from '../coin/coin.service';
import * as admin from 'firebase-admin';

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
        private firestore: FirestoreService,
        private coinService: CoinService,
    ) { }

    async claimDailyReward(userId: string): Promise<DailyRewardResult> {
        const user = await this.firestore.findUnique('users', userId) as any;
        if (!user) throw new Error('User not found');

        const now = new Date();
        const today = this.getDateString(now);
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? this.getDateString(new Date(lastClaimDoc)) : null;

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

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);

        let newStreak: number;
        if (lastClaim === yesterdayStr) newStreak = (user.loginStreak || 0) + 1;
        else newStreak = 1;

        const bonusMultiplier = this.getBonusMultiplier(newStreak);
        const baseReward = 10;
        const totalCoins = Math.floor(baseReward * bonusMultiplier);

        await this.firestore.update('users', userId, {
            loginStreak: newStreak,
            lastDailyRewardClaimed: admin.firestore.FieldValue.serverTimestamp(),
        });

        await this.coinService.addCoins(userId, totalCoins, `Daily reward (Day ${newStreak})`);

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

    async canClaimToday(userId: string) {
        const user = await this.firestore.findUnique('users', userId) as any;
        if (!user) throw new Error('User not found');

        const now = new Date();
        const today = this.getDateString(now);
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? this.getDateString(new Date(lastClaimDoc)) : null;

        const canClaim = lastClaim !== today;
        const currentStreak = user.loginStreak || 0;

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);

        let potentialStreak = canClaim ? (lastClaim === yesterdayStr ? currentStreak + 1 : 1) : currentStreak;
        const potentialReward = Math.floor(10 * this.getBonusMultiplier(potentialStreak));

        let nextRewardAt: Date | null = null;
        if (!canClaim) {
            nextRewardAt = new Date(now);
            nextRewardAt.setDate(nextRewardAt.getDate() + 1);
            nextRewardAt.setHours(0, 0, 0, 0);
        }

        return { canClaim, currentStreak, nextRewardAt, potentialReward };
    }

    async getStreakCalendar(userId: string) {
        const user = await this.firestore.findUnique('users', userId) as any;
        if (!user) throw new Error('User not found');

        const now = new Date();
        const currentStreak = user.loginStreak || 0;
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? new Date(lastClaimDoc) : null;

        const calendar: Array<{ date: string; claimed: boolean; dayNumber: number }> = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = this.getDateString(date);

            let claimed = false;
            if (lastClaim && currentStreak > 0) {
                const streakStart = new Date(lastClaim);
                streakStart.setDate(streakStart.getDate() - (currentStreak - 1));
                claimed = date >= streakStart && date <= lastClaim;
            }

            calendar.push({ date: dateStr, claimed, dayNumber: 7 - i });
        }

        return { days: calendar, currentStreak };
    }

    private getBonusMultiplier(streak: number): number {
        if (streak >= 30) return 3;
        if (streak >= 7) return 2;
        return 1;
    }

    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    async resetStreak(userId: string): Promise<void> {
        await this.firestore.update('users', userId, {
            loginStreak: 0,
            lastDailyRewardClaimed: null,
        });
    }
}
