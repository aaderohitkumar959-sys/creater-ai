"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserService", {
    enumerable: true,
    get: function() {
        return UserService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
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
let UserService = class UserService {
    /**
     * GDPR: Request user data deletion
     * Creates a deletion request with 30-day grace period
     */ async requestDeletion(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) {
            throw new _common.NotFoundException('User not found');
        }
        const token = _crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.firestore.update('users', userId, {
            'metadata.deletionRequested': true,
            'metadata.deletionToken': token,
            'metadata.deletionExpiresAt': expiresAt.toISOString()
        });
        console.log('[GDPR] Deletion requested:', {
            userId,
            expiresAt
        });
        return {
            success: true,
            token,
            expiresAt
        };
    }
    /**
     * GDPR: Confirm and execute user data deletion
     */ async confirmDeletion(token) {
        const users = await this.firestore.findMany('users', (ref)=>ref.where('metadata.deletionToken', '==', token));
        if (users.length === 0) {
            throw new Error('Invalid deletion token');
        }
        const user = users[0];
        const metadata = user.metadata;
        const expiresAt = new Date(metadata.deletionExpiresAt);
        if (expiresAt < new Date()) {
            throw new Error('Deletion token expired');
        }
        console.log('[GDPR] Executing deletion for user:', user.id);
        await this.firestore.runTransaction(async (transaction)=>{
            const userId = user.id;
            // 1. Delete user doc
            transaction.delete(this.firestore.collection('users').doc(userId));
            // 2. Delete conversations (note: this only deletes the top level, sub-collections need special handling if not using recursive delete)
            const convSnapshot = await this.firestore.collection('conversations').where('userId', '==', userId).get();
            convSnapshot.forEach((doc)=>{
                transaction.delete(doc.ref);
            });
            // 3. Delete usage tracking
            transaction.delete(this.firestore.collection('usage_tracking').doc(userId));
        });
        console.log('[GDPR] User data deleted successfully:', user.id);
        return true;
    }
    /**
     * GDPR: Export all user data
     */ async exportData(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) {
            throw new _common.NotFoundException('User not found');
        }
        const conversations = await this.firestore.findMany('conversations', (ref)=>ref.where('userId', '==', userId));
        const exportData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            conversations: conversations.map((conv)=>({
                    personaId: conv.personaId,
                    createdAt: conv.createdAt
                })),
            exportDate: new Date().toISOString()
        };
        console.log('[GDPR] Data exported for user:', userId);
        return exportData;
    }
    /**
     * Cancel deletion request
     */ async cancelDeletion(userId) {
        await this.firestore.update('users', userId, {
            'metadata.deletionRequested': false,
            'metadata.deletionToken': null,
            'metadata.deletionExpiresAt': null
        });
        console.log('[GDPR] Deletion cancelled for user:', userId);
        return true;
    }
    async getUserProfile(userId) {
        const user = await this.firestore.findUnique('users', userId);
        if (!user) {
            throw new _common.NotFoundException('User not found');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            coinBalance: user.coinBalance || 0
        };
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
UserService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], UserService);
