"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QuestService", {
    enumerable: true,
    get: function() {
        return QuestService;
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
let QuestService = class QuestService {
    async getDailyStatus(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new _common.BadRequestException('User not found');
        const now = new Date();
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? new Date(lastClaimDoc) : null;
        let canClaim = true;
        if (lastClaim) {
            const isSameDay = lastClaim.getDate() === now.getDate() && lastClaim.getMonth() === now.getMonth() && lastClaim.getFullYear() === now.getFullYear();
            if (isSameDay) canClaim = false;
        }
        return {
            streak: user.loginStreak || 0,
            canClaim,
            rewardAmount: this.calculateReward((user.loginStreak || 0) + 1)
        };
    }
    async claimDailyReward(userId) {
        const status = await this.getDailyStatus(userId);
        if (!status.canClaim) {
            throw new _common.BadRequestException('Reward already claimed today');
        }
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new _common.BadRequestException('User not found');
        const now = new Date();
        const lastClaimDoc = user.lastDailyRewardClaimed?.toDate ? user.lastDailyRewardClaimed.toDate() : user.lastDailyRewardClaimed;
        const lastClaim = lastClaimDoc ? new Date(lastClaimDoc) : null;
        let newStreak = (user.loginStreak || 0) + 1;
        if (lastClaim) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = lastClaim.getDate() === yesterday.getDate() && lastClaim.getMonth() === yesterday.getMonth() && lastClaim.getFullYear() === yesterday.getFullYear();
            if (!isYesterday) {
                const diffTime = Math.abs(now.getTime() - lastClaim.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 2) newStreak = 1;
            }
        } else {
            newStreak = 1;
        }
        const reward = this.calculateReward(newStreak);
        await this.firestore.update('users', userId, {
            loginStreak: newStreak,
            lastDailyRewardClaimed: _firebaseadmin.firestore.FieldValue.serverTimestamp(),
            lastLoginDate: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        });
        await this.coinService.addCoins(userId, reward, 'Daily Login Reward');
        return {
            streak: newStreak,
            reward,
            message: `Claimed ${reward} coins!`
        };
    }
    calculateReward(streak) {
        return Math.min(10 + (streak - 1) * 5, 50);
    }
    constructor(firestore, coinService){
        this.firestore = firestore;
        this.coinService = coinService;
    }
};
QuestService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _coinservice.CoinService === "undefined" ? Object : _coinservice.CoinService
    ])
], QuestService);
