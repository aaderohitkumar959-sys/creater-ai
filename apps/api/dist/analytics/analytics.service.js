"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AnalyticsService", {
    enumerable: true,
    get: function() {
        return AnalyticsService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AnalyticsService = class AnalyticsService {
    async trackEvent(userId, event, metadata) {
        return this.firestore.create('analytics_events', {
            userId,
            event,
            metadata: metadata || {}
        });
    }
    async getDashboardStats() {
        const db = this.firestore.getFirestore();
        const [totalUsers, totalMessages, payments] = await Promise.all([
            this.firestore.count('users'),
            db.collectionGroup('messages').count().get().then((s)=>s.data().count),
            this.firestore.findMany('payments', (ref)=>ref.where('status', '==', 'COMPLETED'))
        ]);
        const totalRevenue = payments.reduce((sum, p)=>sum + (p.amount || 0), 0);
        const activeUsers24h = await this.firestore.count('users', (ref)=>ref.where('updatedAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)));
        // Revenue chart (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentPayments = payments.filter((p)=>{
            const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
            return date >= thirtyDaysAgo;
        });
        const revenueChart = recentPayments.reduce((acc, p)=>{
            const date = (p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt)).toISOString().split('T')[0];
            const existing = acc.find((item)=>item.date === date);
            if (existing) existing.amount += p.amount || 0;
            else acc.push({
                date,
                amount: p.amount || 0
            });
            return acc;
        }, []).sort((a, b)=>a.date.localeCompare(b.date));
        return {
            totalUsers,
            activeUsers24h,
            totalRevenue,
            totalMessages,
            revenueChart
        };
    }
    async getCreatorStats() {
        const [totalCreators, creators] = await Promise.all([
            this.firestore.count('creators'),
            this.firestore.findMany('creators', (ref)=>ref.orderBy('earnings', 'desc').limit(5))
        ]);
        const topCreators = await Promise.all(creators.map(async (c)=>{
            const user = await this.firestore.findUnique('users', c.userId);
            const personasCount = await this.firestore.count('personas', (ref)=>ref.where('creatorId', '==', c.id));
            return {
                ...c,
                user: {
                    name: user?.name,
                    email: user?.email,
                    image: user?.image
                },
                _count: {
                    personas: personasCount
                }
            };
        }));
        return {
            totalCreators,
            topCreators,
            pendingPayouts: 0
        };
    }
    async getCreatorOverview(userId) {
        const creator = await this.firestore.findUnique('creators', userId);
        if (!creator) throw new Error('Creator not found');
        const personas = await this.firestore.findMany('personas', (ref)=>ref.where('creatorId', '==', creator.id));
        // Total messages for all personas of this creator
        const db = this.firestore.getFirestore();
        let totalMessages = 0;
        for (const persona of personas){
            const count = await db.collectionGroup('messages').where('personaId', '==', persona.id).count().get();
            totalMessages += count.data().count;
        }
        return {
            earnings: creator.earnings || 0,
            personasCount: personas.length,
            totalMessages,
            personas
        };
    }
    async getEarningsTimeSeries(userId, days) {
        const data = [];
        const now = new Date();
        for(let i = days - 1; i >= 0; i--){
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                amount: Math.random() * 100
            });
        }
        return data;
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
AnalyticsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], AnalyticsService);
