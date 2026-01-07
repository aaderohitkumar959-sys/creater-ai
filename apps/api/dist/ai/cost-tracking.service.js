"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CostTrackingService", {
    enumerable: true,
    get: function() {
        return CostTrackingService;
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
let CostTrackingService = class CostTrackingService {
    /**
     * Log AI request for cost tracking
     */ async logAIRequest(request) {
        try {
            await this.firestore.create('ai_requests', {
                ...request,
                createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[COST_TRACKING] Failed to log request:', error.message);
        }
    }
    /**
     * Get cost statistics for user
     */ async getUserCostStats(userId, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const requests = await this.firestore.findMany('ai_requests', (ref)=>ref.where('userId', '==', userId).where('createdAt', '>=', since));
        const totalCost = requests.reduce((sum, r)=>sum + (r.costUSD || 0), 0);
        const totalRequests = requests.length;
        const successfulRequests = requests.filter((r)=>r.success).length;
        const totalLatency = requests.reduce((sum, r)=>sum + (r.latencyMs || 0), 0);
        const byProvider = {};
        for (const req of requests){
            if (!byProvider[req.provider]) {
                byProvider[req.provider] = {
                    cost: 0,
                    requests: 0
                };
            }
            byProvider[req.provider].cost += req.costUSD || 0;
            byProvider[req.provider].requests += 1;
        }
        return {
            totalCost,
            totalRequests,
            successRate: totalRequests > 0 ? successfulRequests / totalRequests * 100 : 0,
            avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
            avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
            byProvider
        };
    }
    /**
     * Check if user is above cost threshold
     */ async isUserAboveCostThreshold(userId, thresholdUSD = 10) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requests = await this.firestore.findMany('ai_requests', (ref)=>ref.where('userId', '==', userId).where('createdAt', '>=', today));
        const todayCost = requests.reduce((sum, r)=>sum + (r.costUSD || 0), 0);
        return todayCost > thresholdUSD;
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
CostTrackingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], CostTrackingService);
