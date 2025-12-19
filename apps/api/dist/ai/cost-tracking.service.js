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
exports.CostTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CostTrackingService = class CostTrackingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAIRequest(request) {
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
        }
        catch (error) {
            console.error('[COST_TRACKING] Failed to log request:', error.message);
        }
    }
    async getUserCostStats(userId, days = 30) {
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
        const byProvider = {};
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
            successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
            avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
            avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
            byProvider,
        };
    }
    async getPlatformCostStats(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const requests = await this.prisma.aIRequest.findMany({
            where: {
                createdAt: { gte: since },
            },
        });
        const totalCost = requests.reduce((sum, r) => sum + Number(r.costUSD), 0);
        const uniqueUsers = new Set(requests.map((r) => r.userId)).size;
        const userStats = {};
        for (const req of requests) {
            if (!userStats[req.userId]) {
                userStats[req.userId] = { cost: 0, requests: 0 };
            }
            userStats[req.userId].cost += Number(req.costUSD);
            userStats[req.userId].requests += 1;
        }
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
    async isUserAboveCostThreshold(userId, thresholdUSD = 10) {
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
};
exports.CostTrackingService = CostTrackingService;
exports.CostTrackingService = CostTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CostTrackingService);
