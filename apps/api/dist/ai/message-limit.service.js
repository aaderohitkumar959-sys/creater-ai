"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MessageLimitService", {
    enumerable: true,
    get: function() {
        return MessageLimitService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _subscriptionservice = require("../subscription/subscription.service");
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
let MessageLimitService = class MessageLimitService {
    /**
     * Check if user can send message (daily limit)
     */ async canSendMessage(userId) {
        const hasPremium = await this.subscriptionService.hasPremiumAccess(userId);
        const limit = hasPremium ? this.PREMIUM_TIER_DAILY_LIMIT : this.FREE_TIER_DAILY_LIMIT;
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new Error('User not found');
        const today = this.getDateString(new Date());
        const lastMsgDateDoc = user.lastMessageDate?.toDate ? user.lastMessageDate.toDate() : user.lastMessageDate;
        const lastMessageDate = lastMsgDateDoc ? this.getDateString(new Date(lastMsgDateDoc)) : null;
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
            resetsAt
        };
    }
    /**
     * Increment message count for user
     */ async incrementMessageCount(userId) {
        const today = new Date();
        const todayString = this.getDateString(today);
        const user = await this.firestore.findUnique('users', userId);
        if (!user) throw new Error('User not found');
        const lastMsgDateDoc = user.lastMessageDate?.toDate ? user.lastMessageDate.toDate() : user.lastMessageDate;
        const lastMessageDate = lastMsgDateDoc ? this.getDateString(new Date(lastMsgDateDoc)) : null;
        if (lastMessageDate !== todayString) {
            await this.firestore.update('users', userId, {
                dailyMessageCount: 1,
                lastMessageDate: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await this.firestore.update('users', userId, {
                dailyMessageCount: _firebaseadmin.firestore.FieldValue.increment(1)
            });
        }
    }
    /**
     * Get usage statistics
     */ async getUsageStats(userId) {
        const stats = await this.canSendMessage(userId);
        return {
            todayCount: stats.limit - stats.remaining,
            limit: stats.limit,
            percentageUsed: Math.round((stats.limit - stats.remaining) / stats.limit * 100),
            tier: stats.limit > this.FREE_TIER_DAILY_LIMIT ? 'PREMIUM' : 'FREE'
        };
    }
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
    constructor(firestore, subscriptionService){
        this.firestore = firestore;
        this.subscriptionService = subscriptionService;
        this.FREE_TIER_DAILY_LIMIT = 100;
        this.PREMIUM_TIER_DAILY_LIMIT = 500;
    }
};
MessageLimitService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _subscriptionservice.SubscriptionService === "undefined" ? Object : _subscriptionservice.SubscriptionService
    ])
], MessageLimitService);
