"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MeteredService", {
    enumerable: true,
    get: function() {
        return MeteredService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
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
let MeteredService = class MeteredService {
    async checkLimit(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) return {
            allowed: false,
            remaining: 0
        };
        // Premium users have no limit
        if (user.subscription?.status === 'ACTIVE' || user.role === 'ADMIN') {
            return {
                allowed: true,
                remaining: -1
            }; // -1 indicates unlimited
        }
        // Check paid message credits
        if (user.paidMessageCredits > 0) {
            return {
                allowed: true,
                remaining: user.paidMessageCredits
            };
        }
        const today = new Date();
        const lastDate = user.lastMessageDate ? user.lastMessageDate.toDate() : new Date(0);
        const isSameDay = today.getDate() === lastDate.getDate() && today.getMonth() === lastDate.getMonth() && today.getFullYear() === lastDate.getFullYear();
        // If it's a new day, they have full limit
        if (!isSameDay) {
            return {
                allowed: true,
                remaining: this.DAILY_LIMIT
            };
        }
        const remaining = Math.max(0, this.DAILY_LIMIT - (user.dailyMessageCount || 0));
        return {
            allowed: remaining > 0,
            remaining
        };
    }
    async incrementUsage(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) return;
        // Priority: Use paid credits first if available
        if (user.paidMessageCredits > 0) {
            await this.firestore.update('users', userId, {
                paidMessageCredits: _firebaseadmin.firestore.FieldValue.increment(-1)
            });
            return;
        }
        const today = new Date();
        const lastDate = user.lastMessageDate ? user.lastMessageDate.toDate() : new Date(0);
        const isSameDay = today.getDate() === lastDate.getDate() && today.getMonth() === lastDate.getMonth() && today.getFullYear() === lastDate.getFullYear();
        if (!isSameDay) {
            // Reset count for new day
            await this.firestore.update('users', userId, {
                dailyMessageCount: 1,
                lastMessageDate: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Increment count
            await this.firestore.update('users', userId, {
                dailyMessageCount: _firebaseadmin.firestore.FieldValue.increment(1),
                lastMessageDate: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        }
    }
    async getRemainingMessages(userId) {
        const { remaining } = await this.checkLimit(userId);
        return remaining;
    }
    constructor(firestore){
        this.firestore = firestore;
        this.DAILY_LIMIT = 40;
    }
};
MeteredService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], MeteredService);
