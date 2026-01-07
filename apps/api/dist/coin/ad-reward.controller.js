"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdRewardController", {
    enumerable: true,
    get: function() {
        return AdRewardController;
    }
});
const _common = require("@nestjs/common");
const _coinservice = require("./coin.service");
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
let AdRewardController = class AdRewardController {
    async validateAdReward(body, req) {
        const userId = req.user.id;
        // In production, validate the token with the ad provider's server
        // For now, we'll use a simple validation for test tokens
        if (body.adProvider === 'test' && body.adToken.startsWith('test_')) {
            // Check if user has exceeded daily ad limit
            const canEarn = await this.coinService.canEarnAdReward(userId);
            if (!canEarn) {
                return {
                    success: false,
                    error: 'Daily ad limit reached. Try again tomorrow!'
                };
            }
            // Grant reward (e.g., 10 coins per ad)
            const newBalance = await this.coinService.grantAdReward(userId, 10);
            return {
                success: true,
                coinsEarned: 10,
                newBalance,
                message: 'Congratulations! You earned 10 coins.'
            };
        }
        // TODO: Add real validation for AdMob, Unity Ads, etc.
        return {
            success: false,
            error: 'Invalid ad token'
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
            coinsPerAd: 10
        };
    }
    constructor(coinService){
        this.coinService = coinService;
    }
};
_ts_decorate([
    (0, _common.Post)('validate'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof AdRewardRequest === "undefined" ? Object : AdRewardRequest,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdRewardController.prototype, "validateAdReward", null);
_ts_decorate([
    (0, _common.Post)('check-availability'),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdRewardController.prototype, "checkAvailability", null);
AdRewardController = _ts_decorate([
    (0, _common.Controller)('coin/ad-reward'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _coinservice.CoinService === "undefined" ? Object : _coinservice.CoinService
    ])
], AdRewardController);
