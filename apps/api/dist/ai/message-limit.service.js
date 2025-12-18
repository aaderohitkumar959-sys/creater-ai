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
exports.MessageLimitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
let MessageLimitService = class MessageLimitService {
    prisma;
    subscriptionService;
    FREE_TIER_DAILY_LIMIT = 100;
    PREMIUM_TIER_DAILY_LIMIT = 500;
    constructor(prisma, subscriptionService) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
    }
    async canSendMessage(userId) {
        const hasPremium = await this.subscriptionService.hasPremiumAccess(userId);
        const limit = hasPremium
            ? this.PREMIUM_TIER_DAILY_LIMIT
            : this.FREE_TIER_DAILY_LIMIT;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                dailyMessageCount: true,
                lastMessageDate: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const today = this.getDateString(new Date());
        const lastMessageDate = user.lastMessageDate
            ? this.getDateString(user.lastMessageDate)
            : null;
        let currentCount = 0;
        if (lastMessageDate === today) {
            currentCount = user.dailyMessageCount || 0;
        }
        const resetsAt = new Date();
        resetsAt.setDate(resetsAt.getDate() + 1);
        resetsAt.setHours(0, 0, 0, 0);
        const remaining = Math.max(0, limit - currentCount);
        const allowed = currentCount < limit;
        return {
            allowed,
            remaining,
            limit,
            resetsAt,
        };
    }
    async incrementMessageCount(userId) {
        const today = new Date();
        const todayString = this.getDateString(today);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const lastMessageDate = user.lastMessageDate
            ? this.getDateString(user.lastMessageDate)
            : null;
        if (lastMessageDate !== todayString) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: 1,
                    lastMessageDate: today,
                },
            });
        }
        else {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: { increment: 1 },
                },
            });
        }
        console.log('[MESSAGE_LIMIT] Incremented count for user:', userId);
    }
    async getUsageStats(userId) {
        const hasPremium = await this.subscriptionService.hasPremiumAccess(userId);
        const limit = hasPremium
            ? this.PREMIUM_TIER_DAILY_LIMIT
            : this.FREE_TIER_DAILY_LIMIT;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const today = this.getDateString(new Date());
        const lastMessageDate = user.lastMessageDate
            ? this.getDateString(user.lastMessageDate)
            : null;
        const todayCount = lastMessageDate === today ? user.dailyMessageCount || 0 : 0;
        return {
            todayCount,
            limit,
            percentageUsed: Math.round((todayCount / limit) * 100),
            tier: hasPremium ? 'PREMIUM' : 'FREE',
        };
    }
    async resetDailyCounts() {
        const result = await this.prisma.user.updateMany({
            data: {
                dailyMessageCount: 0,
            },
        });
        console.log('[MESSAGE_LIMIT] Reset daily counts for all users');
        return result.count;
    }
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
};
exports.MessageLimitService = MessageLimitService;
exports.MessageLimitService = MessageLimitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService])
], MessageLimitService);
//# sourceMappingURL=message-limit.service.js.map