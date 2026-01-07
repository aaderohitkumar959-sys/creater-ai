import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

@Injectable()
export class MeteredService {
  private readonly DAILY_LIMIT = 40;

  constructor(private firestore: FirestoreService) { }

  async checkLimit(
    userId: string,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const user = await this.firestore.findUnique('users', userId) as any;

    if (!user) return { allowed: false, remaining: 0 };

    // Premium users have no limit
    if (user.subscription?.status === 'ACTIVE' || user.role === 'ADMIN') {
      return { allowed: true, remaining: -1 }; // -1 indicates unlimited
    }

    // Check paid message credits
    if (user.paidMessageCredits > 0) {
      return { allowed: true, remaining: user.paidMessageCredits };
    }

    const today = new Date();
    const lastDate = user.lastMessageDate ? (user.lastMessageDate as admin.firestore.Timestamp).toDate() : new Date(0);
    const isSameDay =
      today.getDate() === lastDate.getDate() &&
      today.getMonth() === lastDate.getMonth() &&
      today.getFullYear() === lastDate.getFullYear();

    // If it's a new day, they have full limit
    if (!isSameDay) {
      return { allowed: true, remaining: this.DAILY_LIMIT };
    }

    const remaining = Math.max(0, this.DAILY_LIMIT - (user.dailyMessageCount || 0));
    return { allowed: remaining > 0, remaining };
  }

  async incrementUsage(userId: string): Promise<void> {
    const user = await this.firestore.findUnique('users', userId) as any;

    if (!user) return;

    // Priority: Use paid credits first if available
    if (user.paidMessageCredits > 0) {
      await this.firestore.update('users', userId, {
        paidMessageCredits: admin.firestore.FieldValue.increment(-1),
      });
      return;
    }

    const today = new Date();
    const lastDate = user.lastMessageDate ? (user.lastMessageDate as admin.firestore.Timestamp).toDate() : new Date(0);
    const isSameDay =
      today.getDate() === lastDate.getDate() &&
      today.getMonth() === lastDate.getMonth() &&
      today.getFullYear() === lastDate.getFullYear();

    if (!isSameDay) {
      // Reset count for new day
      await this.firestore.update('users', userId, {
        dailyMessageCount: 1,
        lastMessageDate: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Increment count
      await this.firestore.update('users', userId, {
        dailyMessageCount: admin.firestore.FieldValue.increment(1),
        lastMessageDate: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  async getRemainingMessages(userId: string): Promise<number> {
    const { remaining } = await this.checkLimit(userId);
    return remaining;
  }
}
