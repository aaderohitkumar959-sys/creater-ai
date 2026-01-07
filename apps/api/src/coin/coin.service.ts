import { Injectable, NotFoundException } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

@Injectable()
export class CoinService {
  constructor(private firestore: FirestoreService) { }

  async getBalance(userId: string): Promise<number> {
    const user = await this.firestore.findUnique('users', userId) as any;
    return user?.coinBalance || 0;
  }

  /**
   * Add coins to user wallet
   */
  async addCoins(
    userId: string,
    amount: number,
    description: string,
    metadata?: any,
  ) {
    await this.firestore.runTransaction(async (transaction) => {
      const userRef = this.firestore.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }

      // 1. Create transaction record in sub-collection
      const txRef = userRef.collection('transactions').doc();
      transaction.set(txRef, {
        type: 'PURCHASE',
        amount,
        description,
        metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Update user balance
      transaction.update(userRef, {
        coinBalance: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return this.getBalance(userId);
  }

  /**
   * Deduct coins from user wallet
   */
  async deductCoins(
    userId: string,
    amount: number,
    description: string,
    metadata?: any,
  ): Promise<boolean> {
    try {
      await this.firestore.runTransaction(async (transaction) => {
        const userRef = this.firestore.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) throw new Error('USER_NOT_FOUND');
        const balance = (userDoc.data() as any).coinBalance || 0;

        if (balance < amount) {
          throw new Error('INSUFFICIENT_BALANCE');
        }

        // 1. Create transaction record
        const txRef = userRef.collection('transactions').doc();
        transaction.set(txRef, {
          type: 'SPEND',
          amount: -amount,
          description,
          metadata,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 2. Update balance
        transaction.update(userRef, {
          coinBalance: admin.firestore.FieldValue.increment(-amount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      return true;
    } catch (error) {
      if (error.message === 'INSUFFICIENT_BALANCE' || error.message === 'USER_NOT_FOUND') {
        return false;
      }
      throw error;
    }
  }

  async getTransactionHistory(userId: string, limit = 20) {
    const snapshot = await this.firestore.collection('users')
      .doc(userId)
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async canEarnAdReward(userId: string): Promise<boolean> {
    const adsWatched = await this.getAdsWatchedToday(userId);
    return adsWatched < 5;
  }

  async getAdsWatchedToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await this.firestore.collection('users')
      .doc(userId)
      .collection('transactions')
      .where('type', '==', 'EARN')
      .where('createdAt', '>=', today)
      .get();

    return snapshot.size;
  }

  async grantAdReward(userId: string, amount: number): Promise<number> {
    const canEarn = await this.canEarnAdReward(userId);
    if (!canEarn) {
      throw new Error('Daily ad limit reached');
    }

    await this.addCoins(userId, amount, 'Earned from ad reward', { source: 'ad' });
    return this.getBalance(userId);
  }
}
