"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoinService", {
    enumerable: true,
    get: function() {
        return CoinService;
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
let CoinService = class CoinService {
    async getBalance(userId) {
        const user = await this.firestore.findUnique('users', userId);
        return user?.coinBalance || 0;
    }
    /**
   * Add coins to user wallet
   */ async addCoins(userId, amount, description, metadata) {
        await this.firestore.runTransaction(async (transaction)=>{
            const userRef = this.firestore.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new _common.NotFoundException('User not found');
            }
            // 1. Create transaction record in sub-collection
            const txRef = userRef.collection('transactions').doc();
            transaction.set(txRef, {
                type: 'PURCHASE',
                amount,
                description,
                metadata,
                createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
            // 2. Update user balance
            transaction.update(userRef, {
                coinBalance: _firebaseadmin.firestore.FieldValue.increment(amount),
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        });
        return this.getBalance(userId);
    }
    /**
   * Deduct coins from user wallet
   */ async deductCoins(userId, amount, description, metadata) {
        try {
            await this.firestore.runTransaction(async (transaction)=>{
                const userRef = this.firestore.collection('users').doc(userId);
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('USER_NOT_FOUND');
                const balance = userDoc.data().coinBalance || 0;
                if (balance < amount) {
                    throw new Error('INSUFFICIENT_BALANCE');
                }
                // 1. Create transaction record
                const txRef = userRef.collection('transactions').doc();
                transaction.set(txRef, {
                    type: 'SPEND',
                    amount: -amount,
                    description,
                    metadata,
                    createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
                });
                // 2. Update balance
                transaction.update(userRef, {
                    coinBalance: _firebaseadmin.firestore.FieldValue.increment(-amount),
                    updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
                });
            });
            return true;
        } catch (error) {
            if (error.message === 'INSUFFICIENT_BALANCE' || error.message === 'USER_NOT_FOUND') {
                return false;
            }
            throw error;
        }
    }
    async getTransactionHistory(userId, limit = 20) {
        const snapshot = await this.firestore.collection('users').doc(userId).collection('transactions').orderBy('createdAt', 'desc').limit(limit).get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...doc.data()
            }));
    }
    async canEarnAdReward(userId) {
        const adsWatched = await this.getAdsWatchedToday(userId);
        return adsWatched < 5;
    }
    async getAdsWatchedToday(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const snapshot = await this.firestore.collection('users').doc(userId).collection('transactions').where('type', '==', 'EARN').where('createdAt', '>=', today).get();
        return snapshot.size;
    }
    async grantAdReward(userId, amount) {
        const canEarn = await this.canEarnAdReward(userId);
        if (!canEarn) {
            throw new Error('Daily ad limit reached');
        }
        await this.addCoins(userId, amount, 'Earned from ad reward', {
            source: 'ad'
        });
        return this.getBalance(userId);
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
CoinService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], CoinService);
