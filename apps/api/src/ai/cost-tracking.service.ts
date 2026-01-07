import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

interface AIRequestLog {
    userId: string;
    personaId: string;
    provider: 'openrouter' | 'openai' | 'groq';
    tokensUsed: number;
    costUSD: number;
    latencyMs: number;
    success: boolean;
}

@Injectable()
export class CostTrackingService {
    constructor(private firestore: FirestoreService) { }

    /**
     * Log AI request for cost tracking
     */
    async logAIRequest(request: AIRequestLog): Promise<void> {
        try {
            await this.firestore.create('ai_requests', {
                ...request,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error('[COST_TRACKING] Failed to log request:', error.message);
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

        const requests = await this.firestore.findMany('ai_requests', (ref) =>
            ref.where('userId', '==', userId).where('createdAt', '>=', since)
        ) as any[];

        const totalCost = requests.reduce((sum, r) => sum + (r.costUSD || 0), 0);
        const totalRequests = requests.length;
        const successfulRequests = requests.filter((r) => r.success).length;
        const totalLatency = requests.reduce((sum, r) => sum + (r.latencyMs || 0), 0);

        const byProvider: Record<string, { cost: number; requests: number }> = {};
        for (const req of requests) {
            if (!byProvider[req.provider]) {
                byProvider[req.provider] = { cost: 0, requests: 0 };
            }
            byProvider[req.provider].cost += (req.costUSD || 0);
            byProvider[req.provider].requests += 1;
        }

        return {
            totalCost,
            totalRequests,
            successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
            avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
            avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
            byProvider,
        };
    }

    /**
     * Check if user is above cost threshold
     */
    async isUserAboveCostThreshold(
        userId: string,
        thresholdUSD: number = 10,
    ): Promise<boolean> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const requests = await this.firestore.findMany('ai_requests', (ref) =>
            ref.where('userId', '==', userId).where('createdAt', '>=', today)
        ) as any[];

        const todayCost = requests.reduce((sum, r) => sum + (r.costUSD || 0), 0);

        return todayCost > thresholdUSD;
    }
}
