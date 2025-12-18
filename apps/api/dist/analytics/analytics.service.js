"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async trackEvent(userId, event, metadata) {
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
        const revenueChart = revenueData.reduce((acc, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            const existing = acc.find((item) => item.date === date);
            if (existing) {
                existing.amount += curr._sum.amount || 0;
            }
            else {
                acc.push({ date, amount: curr._sum.amount || 0 });
            }
            return acc;
        }, []);
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
            pendingPayouts: 0,
        };
    }
    async getCreatorOverview(userId) {
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
    async getEarningsTimeSeries(userId, days) {
        const creator = await this.prisma.creator.findUnique({
            where: { userId },
        });
        if (!creator) {
            throw new Error('Creator not found');
        }
        const data = [];
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
    async getMessageStats(userId) {
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
            thisWeek: 0,
            growth: 0,
        };
    }
    async getPersonaPerformance(userId) {
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
        return creator.personas.map((persona) => ({
            id: persona.id,
            name: persona.name,
            conversations: persona._count.conversations,
            messages: 0,
        }));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map