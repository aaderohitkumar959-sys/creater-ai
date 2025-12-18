import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(userId: string): Promise<{
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
    getEarnings(userId: string, days?: string): Promise<{
        date: string;
        amount: number;
    }[]>;
    getMessages(userId: string): Promise<{
        total: number;
        thisWeek: number;
        growth: number;
    }>;
    getPersonas(userId: string): Promise<{
        id: string;
        name: string;
        conversations: number;
        messages: number;
    }[]>;
}
