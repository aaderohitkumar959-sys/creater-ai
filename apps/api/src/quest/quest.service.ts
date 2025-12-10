import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoinService } from '../coin/coin.service';

@Injectable()
export class QuestService {
  constructor(
    private prisma: PrismaService,
    private coinService: CoinService,
  ) { }

  async getDailyStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loginStreak: true, lastDailyRewardClaimed: true },
    });

    if (!user) throw new BadRequestException('User not found');

    const now = new Date();
    const lastClaim = user.lastDailyRewardClaimed
      ? new Date(user.lastDailyRewardClaimed)
      : null;

    let canClaim = true;
    if (lastClaim) {
      const isSameDay =
        lastClaim.getDate() === now.getDate() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getFullYear() === now.getFullYear();
      if (isSameDay) canClaim = false;
    }

    return {
      streak: user.loginStreak,
      canClaim,
      rewardAmount: this.calculateReward(user.loginStreak + 1),
    };
  }

  async claimDailyReward(userId: string) {
    const status = await this.getDailyStatus(userId);
    if (!status.canClaim) {
      throw new BadRequestException('Reward already claimed today');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const now = new Date();
    const lastLogin = new Date(user.lastLoginDate);

    // Check if streak is broken (more than 48 hours since last login/claim logic)
    // For simplicity, let's assume if last claim was yesterday, streak continues.
    // If last claim was before yesterday, streak resets.

    let newStreak = user.loginStreak + 1;
    const lastClaim = user.lastDailyRewardClaimed
      ? new Date(user.lastDailyRewardClaimed)
      : null;

    if (lastClaim) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday =
        lastClaim.getDate() === yesterday.getDate() &&
        lastClaim.getMonth() === yesterday.getMonth() &&
        lastClaim.getFullYear() === yesterday.getFullYear();

      if (!isYesterday) {
        // Streak broken if not claimed yesterday (and not first time)
        // But wait, if they claimed today already, we returned early.
        // If they claimed 2 days ago, streak resets.
        const diffTime = Math.abs(now.getTime() - lastClaim.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 2) newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const reward = this.calculateReward(newStreak);

    // Update user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginStreak: newStreak,
        lastDailyRewardClaimed: now,
        lastLoginDate: now,
      },
    });

    // Add coins
    await this.coinService.addCoins(userId, reward, 'Daily Login Reward');

    return {
      streak: newStreak,
      reward,
      message: `Claimed ${reward} coins!`,
    };
  }

  private calculateReward(streak: number): number {
    // Base reward 10, +5 for every streak day, capped at 50
    return Math.min(10 + (streak - 1) * 5, 50);
  }
}
