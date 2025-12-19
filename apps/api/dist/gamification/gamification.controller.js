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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const daily_reward_service_1 = require("./daily-reward.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GamificationController = class GamificationController {
    dailyRewardService;
    constructor(dailyRewardService) {
        this.dailyRewardService = dailyRewardService;
    }
    async claimDailyReward(req) {
        const userId = req.user.id;
        const result = await this.dailyRewardService.claimDailyReward(userId);
        if (!result.claimed) {
            return {
                success: false,
                message: 'You have already claimed your daily reward today',
                nextRewardAt: result.nextRewardAt,
                currentStreak: result.currentStreak,
            };
        }
        return {
            success: true,
            message: `You earned ${result.coinsGranted} coins! ${result.bonusMultiplier > 1 ? `${result.bonusMultiplier}x streak bonus!` : ''}`,
            coinsGranted: result.coinsGranted,
            currentStreak: result.currentStreak,
            bonusMultiplier: result.bonusMultiplier,
            nextRewardAt: result.nextRewardAt,
        };
    }
    async getDailyRewardStatus(req) {
        const userId = req.user.id;
        return await this.dailyRewardService.canClaimToday(userId);
    }
    async getStreakCalendar(req) {
        const userId = req.user.id;
        return await this.dailyRewardService.getStreakCalendar(userId);
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Post)('daily-reward/claim'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "claimDailyReward", null);
__decorate([
    (0, common_1.Get)('daily-reward/status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getDailyRewardStatus", null);
__decorate([
    (0, common_1.Get)('daily-reward/calendar'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getStreakCalendar", null);
exports.GamificationController = GamificationController = __decorate([
    (0, common_1.Controller)('gamification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [daily_reward_service_1.DailyRewardService])
], GamificationController);
