"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedemptionService", {
    enumerable: true,
    get: function() {
        return RedemptionService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
const _uuid = require("uuid");
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
let RedemptionService = class RedemptionService {
    /**
     * Generate a new single-use redemption code
     */ async generateCode(amount = 500) {
        const raw = (0, _uuid.v4)().split('-')[0].toUpperCase();
        const raw2 = (0, _uuid.v4)().split('-')[1].toUpperCase();
        const code = `PAY-${raw}-${raw2}`;
        await this.firestore.create('redemption_codes', {
            code,
            amount,
            isUsed: false
        });
        return code;
    }
    /**
     * Redeem a code for a user
     */ async redeemCode(userId, code) {
        return await this.firestore.runTransaction(async (transaction)=>{
            const codeClean = code.trim().toUpperCase();
            const codesRef = this.firestore.collection('redemption_codes');
            const snapshot = await codesRef.where('code', '==', codeClean).limit(1).get();
            if (snapshot.empty) {
                throw new _common.NotFoundException('Invalid redemption code');
            }
            const codeDoc = snapshot.docs[0];
            const codeData = codeDoc.data();
            if (codeData.isUsed) {
                throw new _common.BadRequestException('This code has already been used');
            }
            // 1. Mark code as used
            transaction.update(codeDoc.ref, {
                isUsed: true,
                userId,
                usedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
            // 2. Grant credits to user
            const userRef = this.firestore.collection('users').doc(userId);
            transaction.update(userRef, {
                paidMessageCredits: _firebaseadmin.firestore.FieldValue.increment(codeData.amount)
            });
            return {
                success: true,
                grantedAmount: codeData.amount
            };
        });
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
RedemptionService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], RedemptionService);
