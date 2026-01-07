"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DailyRewardService", {
    enumerable: true,
    get: function() {
        return DailyRewardService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _coinservice = require("../coin/coin.service");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DailyRewardService = class DailyRewardService {
    async claimDailyReward(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new Error('User not found');
        const now = new Date();
        const today = this.getDateString(now);
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? this.getDateString(new Date(lastClaimDoc)) : null;
        if (lastClaim === today) {
            const nextReward = new Date(now);
            nextReward.setDate(nextReward.getDate() + 1);
            nextReward.setHours(0, 0, 0, 0);
            return {
                claimed: false,
                coinsGranted: 0,
                currentStreak: user.loginStreak || 0,
                bonusMultiplier: this.getBonusMultiplier(user.loginStreak || 0),
                nextRewardAt: nextReward
            };
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);
        let newStreak;
        if (lastClaim === yesterdayStr) newStreak = (user.loginStreak || 0) + 1;
        else newStreak = 1;
        const bonusMultiplier = this.getBonusMultiplier(newStreak);
        const baseReward = 10;
        const totalCoins = Math.floor(baseReward * bonusMultiplier);
        await this.firestore.update('users', userId, {
            loginStreak: newStreak,
            lastDailyRewardClaimed: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        });
        await this.coinService.addCoins(userId, totalCoins, `Daily reward (Day ${newStreak})`);
        const nextReward = new Date(now);
        nextReward.setDate(nextReward.getDate() + 1);
        nextReward.setHours(0, 0, 0, 0);
        return {
            claimed: true,
            coinsGranted: totalCoins,
            currentStreak: newStreak,
            bonusMultiplier,
            nextRewardAt: nextReward
        };
    }
    async canClaimToday(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new Error('User not found');
        const now = new Date();
        const today = this.getDateString(now);
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? this.getDateString(new Date(lastClaimDoc)) : null;
        const canClaim = lastClaim !== today;
        const currentStreak = user.loginStreak || 0;
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getDateString(yesterday);
        let potentialStreak = canClaim ? lastClaim === yesterdayStr ? currentStreak + 1 : 1 : currentStreak;
        const potentialReward = Math.floor(10 * this.getBonusMultiplier(potentialStreak));
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
            potentialReward
        };
    }
    async getStreakCalendar(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new Error('User not found');
        const now = new Date();
        const currentStreak = user.loginStreak || 0;
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? new Date(lastClaimDoc) : null;
        const calendar = [];
        for(let i = 6; i >= 0; i--){
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = this.getDateString(date);
            let claimed = false;
            if (lastClaim && currentStreak > 0) {
                const streakStart = new Date(lastClaim);
                streakStart.setDate(streakStart.getDate() - (currentStreak - 1));
                claimed = date >= streakStart && date <= lastClaim;
            }
            calendar.push({
                date: dateStr,
                claimed,
                dayNumber: 7 - i
            });
        }
        return {
            days: calendar,
            currentStreak
        };
    }
    getBonusMultiplier(streak) {
        if (streak >= 30) return 3;
        if (streak >= 7) return 2;
        return 1;
    }
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
    async resetStreak(userId) {
        await this.firestore.update('users', userId, {
            loginStreak: 0,
            lastDailyRewardClaimed: null
        });
    }
    constructor(firestore, coinService){
        this.firestore = firestore;
        this.coinService = coinService;
    }
};
DailyRewardService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _coinservice.CoinService === "undefined" ? Object : _coinservice.CoinService
    ])
], DailyRewardService);
