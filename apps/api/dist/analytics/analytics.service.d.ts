import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    trackEvent(userId: string | null, event: string, metadata?: any): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string | null;
        event: string;
    }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        activeUsers24h: number;
        totalRevenue: number;
        totalMessages: number;
        revenueChart: {
            date: string;
            amount: number;
        }[];
    }>;
    getCreatorStats(): Promise<{
        totalCreators: number;
        topCreators: ({
            user: {
                email: string | null;
                name: string | null;
                image: string | null;
            };
            _count: {
                personas: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bio: string | null;
            earnings: number;
            userId: string;
        })[];
        pendingPayouts: number;
    }>;
    getCreatorOverview(userId: string): Promise<{
        earnings: number;
        personasCount: number;
        totalMessages: number;
        personas: ({
            _count: {
                conversations: number;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            description: string | null;
            category: string | null;
            isFeatured: boolean;
            defaultCoinCost: number;
            personality: import("@prisma/client/runtime/library").JsonValue | null;
            creatorId: string;
        })[];
    }>;
    getEarningsTimeSeries(userId: string, days: number): Promise<{
        date: string;
        amount: number;
    }[]>;
    getMessageStats(userId: string): Promise<{
        total: number;
        thisWeek: number;
        growth: number;
    }>;
    getPersonaPerformance(userId: string): Promise<{
        id: string;
        name: string;
        conversations: number;
        messages: number;
    }[]>;
}
