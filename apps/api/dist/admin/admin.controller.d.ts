import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class AdminController {
    private analyticsService;
    private prisma;
    constructor(analyticsService: AnalyticsService, prisma: PrismaService);
    getStats(): Promise<{
        totalUsers: number;
        activeUsers24h: number;
        totalRevenue: number;
        totalMessages: number;
        revenueChart: {
            date: string;
            amount: number;
        }[];
    } | {
        totalRevenue: number;
        totalUsers: number;
        activeUsers24h: number;
        totalMessages: number;
        totalCreators: number;
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
    getUsers(page?: number, search?: string): Promise<{
        data: ({
            _count: {
                reportsMade: number;
                violations: number;
            };
        } & {
            id: string;
            email: string | null;
            name: string | null;
            emailVerified: Date | null;
            image: string | null;
            role: import(".prisma/client").$Enums.Role;
            coins: number;
            dailyMessageCount: number;
            lastMessageDate: Date;
            loginStreak: number;
            lastLoginDate: Date;
            lastDailyRewardClaimed: Date | null;
            stripeCustomerId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            isBanned: boolean;
            bannedUntil: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    updateUserRole(id: string, body: {
        role: Role;
    }): Promise<{
        id: string;
        email: string | null;
        name: string | null;
        emailVerified: Date | null;
        image: string | null;
        role: import(".prisma/client").$Enums.Role;
        coins: number;
        dailyMessageCount: number;
        lastMessageDate: Date;
        loginStreak: number;
        lastLoginDate: Date;
        lastDailyRewardClaimed: Date | null;
        stripeCustomerId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        isBanned: boolean;
        bannedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
