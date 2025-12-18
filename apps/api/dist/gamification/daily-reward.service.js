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
exports.DailyRewardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const coin_service_1 = require("../coin/coin.service");
let DailyRewardService = class DailyRewardService {
    prisma;
    coinService;
    constructor(prisma, coinService) {
        this.prisma = prisma;
        this.coinService = coinService;
    }
    async claimDailyReward(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const now = new Date();
        const today = this.getDateString(now);
        const lastClaim = user.lastDailyRewardClaimed
            ? this.getDateString(user.lastDailyRewardClaimed)
            : null;
        if (lastClaim === today) {
            const nextReward = new Date(now);
            nextReward.setDate(nextReward.getDate() + 1);
            nextReward.setHours(0, 0, 0, 0);
            return {
                claimed: false,
                coinsGranted: 0,
                currentStreak: user.loginStreak || 0,
                bonusMultiplier: this.getBonusMultiplier(user.loginStreak || 0),
                nextRewardAt: nextReward,
            };
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);
        let newStreak;
        if (lastClaim === yesterdayStr) {
            newStreak = (user.loginStreak || 0) + 1;
        }
        else if (lastClaim === null) {
            newStreak = 1;
        }
        else {
            newStreak = 1;
        }
        const bonusMultiplier = this.getBonusMultiplier(newStreak);
        const baseReward = 10;
        const totalCoins = Math.floor(baseReward * bonusMultiplier);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loginStreak: newStreak,
                lastDailyRewardClaimed: now,
            },
        });
        await this.coinService.addCoins(userId, totalCoins, `Daily reward (Day ${newStreak})`, {
            streak: newStreak,
            baseReward,
            bonusMultiplier,
            totalCoins,
        });
        console.log('[DAILY_REWARD] Claimed:', {
            userId,
            streak: newStreak,
            coins: totalCoins,
            multiplier: bonusMultiplier,
        });
        const nextReward = new Date(now);
        nextReward.setDate(nextReward.getDate() + 1);
        nextReward.setHours(0, 0, 0, 0);
        return {
            claimed: true,
            coinsGranted: totalCoins,
            currentStreak: newStreak,
            bonusMultiplier,
            nextRewardAt: nextReward,
        };
    }
    async canClaimToday(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const now = new Date();
        const today = this.getDateString(now);
        const lastClaim = user.lastDailyRewardClaimed
            ? this.getDateString(user.lastDailyRewardClaimed)
            : null;
        const canClaim = lastClaim !== today;
        const currentStreak = user.loginStreak || 0;
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);
        let potentialStreak;
        if (canClaim) {
            if (lastClaim === yesterdayStr) {
                potentialStreak = currentStreak + 1;
            }
            else {
                potentialStreak = 1;
            }
        }
        else {
            potentialStreak = currentStreak;
        }
        const bonusMultiplier = this.getBonusMultiplier(potentialStreak);
        const potentialReward = Math.floor(10 * bonusMultiplier);
        let nextRewardAt = null;
        if (!canClaim) {
            nextRewardAt = new Date(now);
            nextRewardAt.setDate(nextRewardAt.getDate() + 1);
            nextRewardAt.setHours(0, 0, 0, 0);
        }
        return {
            canClaim,
            currentStreak,
            nextRewardAt,
            potentialReward,
        };
    }
    async getStreakCalendar(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const now = new Date();
        const currentStreak = user.loginStreak || 0;
        const lastClaim = user.lastDailyRewardClaimed;
        const calendar = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = this.getDateString(date);
            let claimed = false;
            if (lastClaim && currentStreak > 0) {
                const daysSinceLastClaim = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
                const streakStart = new Date(lastClaim);
                streakStart.setDate(streakStart.getDate() - (currentStreak - 1));
                claimed = date >= streakStart && date <= lastClaim;
            }
            calendar.push({
                date: dateStr,
                claimed,
                dayNumber: 7 - i,
            });
        }
        return {
            days: calendar,
            currentStreak,
        };
    }
    getBonusMultiplier(streak) {
        if (streak >= 30)
            return 3;
        if (streak >= 7)
            return 2;
        return 1;
    }
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
    async resetStreak(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loginStreak: 0,
                lastDailyRewardClaimed: null,
            },
        });
        console.log('[DAILY_REWARD] Streak reset for user:', userId);
    }
};
exports.DailyRewardService = DailyRewardService;
exports.DailyRewardService = DailyRewardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coin_service_1.CoinService])
], DailyRewardService);
//# sourceMappingURL=daily-reward.service.js.map