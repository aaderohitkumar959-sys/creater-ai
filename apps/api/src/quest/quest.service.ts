import { Injectable, BadRequestException } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import { CoinService } from '../coin/coin.service';
import * as admin from 'firebase-admin';

@Injectable()
export class QuestService {
  constructor(
    private firestore: FirestoreService,
    private coinService: CoinService,
  ) { }

  async getDailyStatus(userId: string) {
    const user = await this.firestore.findUnique('users', userId) as any;
    if (!user) throw new BadRequestException('User not found');

    const now = new Date();
    const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
    const lastClaim = lastClaimDoc ? new Date(lastClaimDoc) : null;

    let canClaim = true;
    if (lastClaim) {
      const isSameDay =
        lastClaim.getDate() === now.getDate() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getFullYear() === now.getFullYear();
      if (isSameDay) canClaim = false;
    }

    return {
      streak: user.loginStreak || 0,
      canClaim,
      rewardAmount: this.calculateReward((user.loginStreak || 0) + 1),
    };
  }

  async claimDailyReward(userId: string) {
    const status = await this.getDailyStatus(userId);
    if (!status.canClaim) {
      throw new BadRequestException('Reward already claimed today');
    }

    const user = await this.firestore.findUnique('users', userId) as any;
    if (!user) throw new BadRequestException('User not found');

    const now = new Date();
    const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
    const lastClaim = lastClaimDoc ? new Date(lastClaimDoc) : null;

    let newStreak = (user.loginStreak || 0) + 1;

    if (lastClaim) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday =
        lastClaim.getDate() === yesterday.getDate() &&
        lastClaim.getMonth() === yesterday.getMonth() &&
        lastClaim.getFullYear() === yesterday.getFullYear();

      if (!isYesterday) {
        const diffTime = Math.abs(now.getTime() - lastClaim.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 2) newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const reward = this.calculateReward(newStreak);

    await this.firestore.update('users', userId, {
      loginStreak: newStreak,
      lastDailyRewardClaimed: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginDate: admin.firestore.FieldValue.serverTimestamp(),
    });

    await this.coinService.addCoins(userId, reward, 'Daily Login Reward');

    return {
      streak: newStreak,
      reward,
      message: `Claimed ${reward} coins!`,
    };
  }

  private calculateReward(streak: number): number {
    return Math.min(10 + (streak - 1) * 5, 50);
  }
}
