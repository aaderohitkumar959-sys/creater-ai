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
exports.QuestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const coin_service_1 = require("../coin/coin.service");
let QuestService = class QuestService {
    prisma;
    coinService;
    constructor(prisma, coinService) {
        this.prisma = prisma;
        this.coinService = coinService;
    }
    async getDailyStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { loginStreak: true, lastDailyRewardClaimed: true },
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const now = new Date();
        const lastClaim = user.lastDailyRewardClaimed
            ? new Date(user.lastDailyRewardClaimed)
            : null;
        let canClaim = true;
        if (lastClaim) {
            const isSameDay = lastClaim.getDate() === now.getDate() &&
                lastClaim.getMonth() === now.getMonth() &&
                lastClaim.getFullYear() === now.getFullYear();
            if (isSameDay)
                canClaim = false;
        }
        return {
            streak: user.loginStreak,
            canClaim,
            rewardAmount: this.calculateReward(user.loginStreak + 1),
        };
    }
    async claimDailyReward(userId) {
        const status = await this.getDailyStatus(userId);
        if (!status.canClaim) {
            throw new common_1.BadRequestException('Reward already claimed today');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const now = new Date();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : new Date(0);
        let newStreak = user.loginStreak + 1;
        const lastClaim = user.lastDailyRewardClaimed
            ? new Date(user.lastDailyRewardClaimed)
            : null;
        if (lastClaim) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = lastClaim.getDate() === yesterday.getDate() &&
                lastClaim.getMonth() === yesterday.getMonth() &&
                lastClaim.getFullYear() === yesterday.getFullYear();
            if (!isYesterday) {
                const diffTime = Math.abs(now.getTime() - lastClaim.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 2)
                    newStreak = 1;
            }
        }
        else {
            newStreak = 1;
        }
        const reward = this.calculateReward(newStreak);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                loginStreak: newStreak,
                lastDailyRewardClaimed: now,
                lastLoginDate: now,
            },
        });
        await this.coinService.addCoins(userId, reward, 'Daily Login Reward');
        return {
            streak: newStreak,
            reward,
            message: `Claimed ${reward} coins!`,
        };
    }
    calculateReward(streak) {
        return Math.min(10 + (streak - 1) * 5, 50);
    }
};
exports.QuestService = QuestService;
exports.QuestService = QuestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coin_service_1.CoinService])
], QuestService);
