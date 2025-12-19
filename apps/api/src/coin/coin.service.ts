import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoinService {
  constructor(private prisma: PrismaService) { }

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.coinWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.coinWallet.create({
        data: { userId },
      });
    }

    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.coinWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return 0; // Return 0 instead of creating/crashing if user doesn't exist
    }

    return wallet.balance;
  }

  /**
   * Add coins to user wallet (used for purchases, rewards)
   * Uses database transaction for atomicity
   */
  async addCoins(
    userId: string,
    amount: number,
    description: string,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    // FIXED: Use transaction for atomicity
    return await this.prisma.$transaction(async (tx) => {
      await tx.coinTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PURCHASE',
          amount,
          description,
          metadata,
        },
      });

      const updatedWallet = await tx.coinWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      return updatedWallet.balance;
    });
  }

  /**
   * Deduct coins from user wallet (used for messages, purchases)
   * Uses transaction with optimistic locking to prevent race conditions
   * Returns true if successful, false if insufficient balance
   */
  async deductCoins(
    userId: string,
    amount: number,
    description: string,
    metadata?: any,
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Get wallet with current balance
        const wallet = await tx.coinWallet.findUnique({
          where: { userId },
        });

        if (!wallet || wallet.balance < amount) {
          throw new Error('INSUFFICIENT_BALANCE');
        }

        // Create transaction record
        await tx.coinTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'SPEND',
            amount: -amount,
            description,
            metadata,
          },
        });

        // Update wallet balance with constraint check
        const updated = await tx.coinWallet.updateMany({
          where: {
            id: wallet.id,
            balance: { gte: amount }, // Ensure balance hasn't changed
          },
          data: { balance: { decrement: amount } },
        });

        if (updated.count === 0) {
          throw new Error('CONCURRENT_MODIFICATION');
        }
      }, {
        isolationLevel: 'Serializable', // Highest isolation for money operations
      });

      return true;
    } catch (error) {
      if (error.message === 'INSUFFICIENT_BALANCE' || error.message === 'CONCURRENT_MODIFICATION') {
        return false;
      }
      throw error;
    }
  }

  /**
   * DEPRECATED: This method will be removed in user-only platform
   * All personas are platform-owned, no creator revenue split
   */
  async addCreatorEarnings(
    creatorUserId: string,
    amount: number,
    metadata?: any,
  ) {
    // TODO: Remove this method after removing creator features
    console.warn('[DEPRECATED] addCreatorEarnings should not be used in user-only platform');

    const platformFee = Math.floor(amount * 0.3);
    const creatorEarnings = amount - platformFee;

    const wallet = await this.getOrCreateWallet(creatorUserId);

    await this.prisma.coinTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'EARN',
        amount: creatorEarnings,
        description: 'Creator earnings from message',
        metadata: { ...metadata, platformFee, grossAmount: amount },
      },
    });

    await this.prisma.coinWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: creatorEarnings } },
    });

    return creatorEarnings;
  }

  async getTransactionHistory(userId: string, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId);

    return this.prisma.coinTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async canEarnAdReward(userId: string): Promise<boolean> {
    const adsWatched = await this.getAdsWatchedToday(userId);
    return adsWatched < 5; // Max 5 ads per day
  }

  async getAdsWatchedToday(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.coinTransaction.count({
      where: {
        walletId: wallet.id,
        type: 'EARN',
        description: { contains: 'ad reward' },
        createdAt: { gte: today },
      },
    });

    return count;
  }

  async grantAdReward(userId: string, amount: number): Promise<number> {
    const canEarn = await this.canEarnAdReward(userId);
    if (!canEarn) {
      throw new Error('Daily ad limit reached');
    }

    const wallet = await this.getOrCreateWallet(userId);

    // FIXED: Use transaction
    return await this.prisma.$transaction(async (tx) => {
      await tx.coinTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'EARN',
          amount,
          description: 'Earned from ad reward',
          metadata: { source: 'advertisement', timestamp: new Date() },
        },
      });

      const updated = await tx.coinWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      return updated.balance;
    });
  }

  /**
   * Verify wallet integrity (for admin/debugging)
   * Checks if transaction sum matches wallet balance
   */
  async verifyWalletIntegrity(userId: string): Promise<{
    isValid: boolean;
    walletBalance: number;
    transactionSum: number;
    difference: number;
  }> {
    const wallet = await this.getOrCreateWallet(userId);

    const transactions = await this.prisma.coinTransaction.findMany({
      where: { walletId: wallet.id },
    });

    const transactionSum = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const difference = wallet.balance - transactionSum;

    return {
      isValid: difference === 0,
      walletBalance: wallet.balance,
      transactionSum,
      difference,
    };
  }
}
