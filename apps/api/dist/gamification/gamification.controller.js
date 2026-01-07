"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GamificationController", {
    enumerable: true,
    get: function() {
        return GamificationController;
    }
});
const _common = require("@nestjs/common");
const _dailyrewardservice = require("./daily-reward.service");
const _jwtauthguard = require("../auth/jwt-auth.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let GamificationController = class GamificationController {
    /**
     * Claim daily reward
     */ async claimDailyReward(req) {
        const userId = req.user.id;
        const result = await this.dailyRewardService.claimDailyReward(userId);
        if (!result.claimed) {
            return {
                success: false,
                message: 'You have already claimed your daily reward today',
                nextRewardAt: result.nextRewardAt,
                currentStreak: result.currentStreak
            };
        }
        return {
            success: true,
            message: `You earned ${result.coinsGranted} coins! ${result.bonusMultiplier > 1 ? `${result.bonusMultiplier}x streak bonus!` : ''}`,
            coinsGranted: result.coinsGranted,
            currentStreak: result.currentStreak,
            bonusMultiplier: result.bonusMultiplier,
            nextRewardAt: result.nextRewardAt
        };
    }
    /**
     * Check if user can claim today
     */ async getDailyRewardStatus(req) {
        const userId = req.user.id;
        return await this.dailyRewardService.canClaimToday(userId);
    }
    /**
     * Get login streak calendar
     */ async getStreakCalendar(req) {
        const userId = req.user.id;
        return await this.dailyRewardService.getStreakCalendar(userId);
    }
    constructor(dailyRewardService){
        this.dailyRewardService = dailyRewardService;
    }
};
_ts_decorate([
    (0, _common.Post)('daily-reward/claim'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], GamificationController.prototype, "claimDailyReward", null);
_ts_decorate([
    (0, _common.Get)('daily-reward/status'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], GamificationController.prototype, "getDailyRewardStatus", null);
_ts_decorate([
    (0, _common.Get)('daily-reward/calendar'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], GamificationController.prototype, "getStreakCalendar", null);
GamificationController = _ts_decorate([
    (0, _common.Controller)('gamification'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dailyrewardservice.DailyRewardService === "undefined" ? Object : _dailyrewardservice.DailyRewardService
    ])
], GamificationController);
