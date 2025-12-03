import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async trackEvent(userId: string | null, event: string, metadata?: any) {
        return this.prisma.analyticsEvent.create({
            data: {
                userId,
                event,
                metadata: metadata || {},
            },
        });
    }

    async getDashboardStats() {
        const [totalUsers, totalRevenue, totalMessages, activeUsers24h] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED' },
            }),
            this.prisma.message.count(),
            this.prisma.user.count({
                where: {
                    updatedAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        // Get revenue chart data (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const revenueData = await this.prisma.payment.groupBy({
            by: ['createdAt'],
            _sum: { amount: true },
            where: {
                status: 'COMPLETED',
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Format revenue data by day
        const revenueChart = revenueData.reduce((acc, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            const existing = acc.find(item => item.date === date);
            if (existing) {
                existing.amount += curr._sum.amount || 0;
            } else {
                acc.push({ date, amount: curr._sum.amount || 0 });
            }
            return acc;
        }, [] as { date: string; amount: number }[]);

        return {
            totalUsers,
            activeUsers24h,
            totalRevenue: totalRevenue._sum.amount || 0,
            totalMessages,
            revenueChart,
        };
    }

    async getCreatorStats() {
        const [totalCreators, topCreators] = await Promise.all([
            this.prisma.creator.count(),
            this.prisma.creator.findMany({
                take: 5,
                orderBy: { earnings: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true, image: true },
                    },
                    _count: {
                        select: { personas: true },
                    },
                },
            }),
        ]);

        return {
            totalCreators,
            topCreators,
            pendingPayouts: 0, // Placeholder for now
        };
    }

    // Creator-specific analytics
    async getCreatorOverview(userId: string) {
        const creator = await this.prisma.creator.findUnique({
            where: { userId },
            include: {
                personas: {
                    include: {
                        _count: {
                            select: { conversations: true },
                        },
                    },
                },
            },
        });

        if (!creator) {
            throw new Error('Creator not found');
        }

        const messageCount = await this.prisma.message.count({
            where: {
                conversation: {
                    persona: {
                        creatorId: creator.id,
                    },
                },
            },
        });

        return {
            earnings: creator.earnings,
            personasCount: creator.personas.length,
            totalMessages: messageCount,
            personas: creator.personas,
        };
    }

    async getEarningsTimeSeries(userId: string, days: number) {
        const creator = await this.prisma.creator.findUnique({
            where: { userId },
        });

        if (!creator) {
            throw new Error('Creator not found');
        }

        // Mock data for now - would need Payment-Creator relation
        const data: Array<{ date: string; amount: number }> = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                amount: Math.random() * 100,
            });
        }

        return data;
    }

    async getMessageStats(userId: string) {
        const creator = await this.prisma.creator.findUnique({
            where: { userId },
        });

        if (!creator) {
            throw new Error('Creator not found');
        }

        const totalMessages = await this.prisma.message.count({
            where: {
                conversation: {
                    persona: {
                        creatorId: creator.id,
                    },
                },
            },
        });

        return {
            total: totalMessages,
            thisWeek: 0, // Would need date filters
            growth: 0,
        };
    }

    async getPersonaPerformance(userId: string) {
        const creator = await this.prisma.creator.findUnique({
            where: { userId },
            include: {
                personas: {
                    include: {
                        _count: {
                            select: { conversations: true },
                        },
                    },
                },
            },
        });

        if (!creator) {
            throw new Error('Creator not found');
        }

        return creator.personas.map(persona => ({
            id: persona.id,
            name: persona.name,
            conversations: persona._count.conversations,
            messages: 0, // Would need aggregation
        }));
    }
}
