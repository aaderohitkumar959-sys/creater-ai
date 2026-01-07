import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

@Injectable()
export class AnalyticsService {
  constructor(private firestore: FirestoreService) { }

  async trackEvent(userId: string | null, event: string, metadata?: any) {
    return this.firestore.create('analytics_events', {
      userId,
      event,
      metadata: metadata || {},
    });
  }

  async getDashboardStats() {
    const db = this.firestore.getFirestore();

    const [totalUsers, totalMessages, payments] = await Promise.all([
      this.firestore.count('users'),
      db.collectionGroup('messages').count().get().then(s => s.data().count),
      this.firestore.findMany('payments', (ref) => ref.where('status', '==', 'COMPLETED')) as Promise<any[]>,
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const activeUsers24h = await this.firestore.count('users', (ref) =>
      ref.where('updatedAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
    );

    // Revenue chart (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPayments = payments.filter(p => {
      const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      return date >= thirtyDaysAgo;
    });

    const revenueChart = recentPayments.reduce((acc, p) => {
      const date = (p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt)).toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      if (existing) existing.amount += (p.amount || 0);
      else acc.push({ date, amount: (p.amount || 0) });
      return acc;
    }, [] as { date: string; amount: number }[]).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalUsers,
      activeUsers24h,
      totalRevenue,
      totalMessages,
      revenueChart,
    };
  }

  async getCreatorStats() {
    const [totalCreators, creators] = await Promise.all([
      this.firestore.count('creators'),
      this.firestore.findMany('creators', (ref) => ref.orderBy('earnings', 'desc').limit(5)) as Promise<any[]>,
    ]);

    const topCreators = await Promise.all(creators.map(async (c) => {
      const user = await this.firestore.findUnique('users', c.userId) as any;
      const personasCount = await this.firestore.count('personas', (ref) => ref.where('creatorId', '==', c.id));
      return {
        ...c,
        user: { name: user?.name, email: user?.email, image: user?.image },
        _count: { personas: personasCount }
      };
    }));

    return { totalCreators, topCreators, pendingPayouts: 0 };
  }

  async getCreatorOverview(userId: string) {
    const creator = await this.firestore.findUnique('creators', userId) as any;
    if (!creator) throw new Error('Creator not found');

    const personas = await this.firestore.findMany('personas', (ref) => ref.where('creatorId', '==', creator.id)) as any[];

    // Total messages for all personas of this creator
    const db = this.firestore.getFirestore();
    let totalMessages = 0;
    for (const persona of personas) {
      const count = await db.collectionGroup('messages')
        .where('personaId', '==', persona.id)
        .count()
        .get();
      totalMessages += count.data().count;
    }

    return {
      earnings: creator.earnings || 0,
      personasCount: personas.length,
      totalMessages,
      personas,
    };
  }

  async getEarningsTimeSeries(userId: string, days: number) {
    const data: Array<{ date: string; amount: number }> = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({ date: date.toISOString().split('T')[0], amount: Math.random() * 100 });
    }
    return data;
  }
}
