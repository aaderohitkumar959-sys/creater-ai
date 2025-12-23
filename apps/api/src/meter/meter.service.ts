import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeteredService {
  private readonly DAILY_LIMIT = 40;

  constructor(private prisma: PrismaService) { }

  async checkLimit(
    userId: string,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyMessageCount: true,
        lastMessageDate: true,
        role: true,
        subscription: true,
        paidMessageCredits: true,
      } as any,
    });

    if (!user) return { allowed: false, remaining: 0 };

    // Premium users have no limit
    if (user.subscription?.status === 'ACTIVE' || user.role === 'ADMIN') {
      return { allowed: true, remaining: -1 }; // -1 indicates unlimited
    }

    // Check paid message credits first
    if ((user as any).paidMessageCredits > 0) {
      return { allowed: true, remaining: (user as any).paidMessageCredits };
    }

    const today = new Date();
    const lastDate = user.lastMessageDate ? new Date(user.lastMessageDate) : new Date(0);
    const isSameDay =
      today.getDate() === lastDate.getDate() &&
      today.getMonth() === lastDate.getMonth() &&
      today.getFullYear() === lastDate.getFullYear();

    // If it's a new day, they have full limit
    if (!isSameDay) {
      return { allowed: true, remaining: this.DAILY_LIMIT };
    }

    const remaining = Math.max(0, this.DAILY_LIMIT - user.dailyMessageCount);
    return { allowed: remaining > 0, remaining };
  }

  async incrementUsage(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyMessageCount: true, lastMessageDate: true, paidMessageCredits: true } as any,
    });

    if (!user) return;

    // Priority: Use paid credits first if available
    if ((user as any).paidMessageCredits > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          paidMessageCredits: { decrement: 1 },
        },
      });
      return;
    }

    const today = new Date();
    const lastDate = user.lastMessageDate ? new Date(user.lastMessageDate) : new Date(0);
    const isSameDay =
      today.getDate() === lastDate.getDate() &&
      today.getMonth() === lastDate.getMonth() &&
      today.getFullYear() === lastDate.getFullYear();

    if (!isSameDay) {
      // Reset count for new day
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dailyMessageCount: 1,
          lastMessageDate: today,
        },
      });
    } else {
      // Increment count
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dailyMessageCount: { increment: 1 },
          lastMessageDate: today,
        },
      });
    }
  }

  async getRemainingMessages(userId: string): Promise<number> {
    const { remaining } = await this.checkLimit(userId);
    return remaining;
  }
}
