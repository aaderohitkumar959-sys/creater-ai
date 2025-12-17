import { Injectable } from '@nestjs/common';
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

@Injectable()
export class CostTrackingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Log AI request for cost tracking
     */
    async logAIRequest(request: AIRequestLog): Promise<void> {
        try {
            await this.prisma.aIRequest.create({
                data: {
                    userId: request.userId,
                    personaId: request.personaId,
                    provider: request.provider,
                    tokensUsed: request.tokensUsed,
                    costUSD: request.costUSD,
                    latencyMs: request.latencyMs,
                    success: request.success,
                },
            });
        } catch (error) {
            console.error('[COST_TRACKING] Failed to log request:', error.message);
            // Don't throw - logging failure shouldn't break AI flow
        }
    }

    /**
     * Get cost statistics for user
     */
    async getUserCostStats(
        userId: string,
        days: number = 30,
    ): Promise<{
        totalCost: number;
        totalRequests: number;
        successRate: number;
        avgCostPerRequest: number;
        avgLatency: number;
        byProvider: Record<string, { cost: number; requests: number }>;
    }> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const requests = await this.prisma.aIRequest.findMany({
            where: {
                userId,
                createdAt: { gte: since },
            },
        });

        const totalCost = requests.reduce((sum, r) => sum + Number(r.costUSD), 0);
        const totalRequests = requests.length;
        const successfulRequests = requests.filter((r) => r.success).length;
        const totalLatency = requests.reduce((sum, r) => sum + r.latencyMs, 0);

        // Group by provider
        const byProvider: Record<string, { cost: number; requests: number }> = {};
        for (const req of requests) {
            if (!byProvider[req.provider]) {
                byProvider[req.provider] = { cost: 0, requests: 0 };
            }
            byProvider[req.provider].cost += Number(req.costUSD);
            byProvider[req.provider].requests += 1;
        }

        return {
            totalCost,
            totalRequests,
            successRate:
                totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
            avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
            avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
            byProvider,
        };
    }

    /**
     * Get platform-wide cost statistics (admin)
     */
    async getPlatformCostStats(days: number = 30): Promise<{
        totalCost: number;
        totalRequests: number;
        uniqueUsers: number;
        topUsers: Array<{ userId: string; cost: number; requests: number }>;
    }> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const requests = await this.prisma.aIRequest.findMany({
            where: {
                createdAt: { gte: since },
            },
        });

        const totalCost = requests.reduce((sum, r) => sum + Number(r.costUSD), 0);
        const uniqueUsers = new Set(requests.map((r) => r.userId)).size;

        // Group by user
        const userStats: Record<string, { cost: number; requests: number }> = {};
        for (const req of requests) {
            if (!userStats[req.userId]) {
                userStats[req.userId] = { cost: 0, requests: 0 };
            }
            userStats[req.userId].cost += Number(req.costUSD);
            userStats[req.userId].requests += 1;
        }

        // Get top 10 users by cost
        const topUsers = Object.entries(userStats)
            .map(([userId, stats]) => ({ userId, ...stats }))
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 10);

        return {
            totalCost,
            totalRequests: requests.length,
            uniqueUsers,
            topUsers,
        };
    }

    /**
     * Check if user is above cost threshold (abuse detection)
     */
    async isUserAboveCostThreshold(
        userId: string,
        thresholdUSD: number = 10,
    ): Promise<boolean> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const requests = await this.prisma.aIRequest.findMany({
            where: {
                userId,
                createdAt: { gte: today },
            },
        });

        const todayCost = requests.reduce((sum, r) => sum + Number(r.costUSD), 0);

        return todayCost > thresholdUSD;
    }
}
