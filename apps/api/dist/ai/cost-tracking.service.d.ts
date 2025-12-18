import { PrismaService } from '../prisma/prisma.service';
interface AIRequestLog {
    userId: string;
    personaId: string;
    provider: 'openrouter' | 'openai';
    tokensUsed: number;
    costUSD: number;
    latencyMs: number;
    success: boolean;
}
export declare class CostTrackingService {
    private prisma;
    constructor(prisma: PrismaService);
    logAIRequest(request: AIRequestLog): Promise<void>;
    getUserCostStats(userId: string, days?: number): Promise<{
        totalCost: number;
        totalRequests: number;
        successRate: number;
        avgCostPerRequest: number;
        avgLatency: number;
        byProvider: Record<string, {
            cost: number;
            requests: number;
        }>;
    }>;
    getPlatformCostStats(days?: number): Promise<{
        totalCost: number;
        totalRequests: number;
        uniqueUsers: number;
        topUsers: Array<{
            userId: string;
            cost: number;
            requests: number;
        }>;
    }>;
    isUserAboveCostThreshold(userId: string, thresholdUSD?: number): Promise<boolean>;
}
export {};
