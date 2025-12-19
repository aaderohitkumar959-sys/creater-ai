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
exports.AdRewardController = void 0;
const common_1 = require("@nestjs/common");
const coin_service_1 = require("./coin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AdRewardController = class AdRewardController {
    coinService;
    constructor(coinService) {
        this.coinService = coinService;
    }
    async validateAdReward(body, req) {
        const userId = req.user.id;
        if (body.adProvider === 'test' && body.adToken.startsWith('test_')) {
            const canEarn = await this.coinService.canEarnAdReward(userId);
            if (!canEarn) {
                return {
                    success: false,
                    error: 'Daily ad limit reached. Try again tomorrow!',
                };
            }
            const newBalance = await this.coinService.grantAdReward(userId, 10);
            return {
                success: true,
                coinsEarned: 10,
                newBalance,
                message: 'Congratulations! You earned 10 coins.',
            };
        }
        return {
            success: false,
            error: 'Invalid ad token',
        };
    }
    async checkAvailability(req) {
        const userId = req.user.id;
        const canEarn = await this.coinService.canEarnAdReward(userId);
        const adsWatchedToday = await this.coinService.getAdsWatchedToday(userId);
        return {
            canEarn,
            adsWatchedToday,
            maxAdsPerDay: 5,
            coinsPerAd: 10,
        };
    }
};
exports.AdRewardController = AdRewardController;
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdRewardController.prototype, "validateAdReward", null);
__decorate([
    (0, common_1.Post)('check-availability'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdRewardController.prototype, "checkAvailability", null);
exports.AdRewardController = AdRewardController = __decorate([
    (0, common_1.Controller)('coin/ad-reward'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [coin_service_1.CoinService])
], AdRewardController);
