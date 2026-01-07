"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get SubscriptionService () {
        return SubscriptionService;
    },
    get SubscriptionTier () {
        return SubscriptionTier;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
const _stripe = /*#__PURE__*/ _interop_require_default(require("stripe"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
var SubscriptionTier = /*#__PURE__*/ function(SubscriptionTier) {
    SubscriptionTier["FREE"] = "FREE";
    SubscriptionTier["STARTER_MONTHLY"] = "STARTER_MONTHLY";
    SubscriptionTier["STARTER_YEARLY"] = "STARTER_YEARLY";
    SubscriptionTier["PREMIUM_MONTHLY"] = "PREMIUM_MONTHLY";
    SubscriptionTier["PREMIUM_YEARLY"] = "PREMIUM_YEARLY";
    SubscriptionTier["UNLIMITED_MONTHLY"] = "UNLIMITED_MONTHLY";
    SubscriptionTier["UNLIMITED_YEARLY"] = "UNLIMITED_YEARLY";
    return SubscriptionTier;
}({});
let SubscriptionService = class SubscriptionService {
    getBenefits(tier) {
        const benefits = {
            ["FREE"]: {
                messagesPerDay: 50,
                hasLongTermMemory: false,
                priorityAI: false,
                adFree: false,
                earlyAccess: false
            },
            ["STARTER_MONTHLY"]: {
                messagesPerDay: 200,
                hasLongTermMemory: true,
                priorityAI: false,
                adFree: true,
                earlyAccess: false
            },
            ["STARTER_YEARLY"]: {
                messagesPerDay: 200,
                hasLongTermMemory: true,
                priorityAI: false,
                adFree: true,
                earlyAccess: false
            },
            ["PREMIUM_MONTHLY"]: {
                messagesPerDay: 500,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true
            },
            ["PREMIUM_YEARLY"]: {
                messagesPerDay: 500,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true
            },
            ["UNLIMITED_MONTHLY"]: {
                messagesPerDay: 999999,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true
            },
            ["UNLIMITED_YEARLY"]: {
                messagesPerDay: 999999,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true
            }
        };
        return benefits[tier];
    }
    async getSubscriptionStatus(userId) {
        const subscription = await this.firestore.findUnique('subscriptions', userId);
        if (!subscription || subscription.status !== 'ACTIVE') {
            return {
                tier: "FREE",
                status: 'FREE',
                benefits: this.getBenefits("FREE")
            };
        }
        const tier = subscription.tier;
        return {
            tier,
            status: subscription.status,
            benefits: this.getBenefits(tier),
            currentPeriodEnd: subscription.currentPeriodEnd?.toDate?.() || subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        };
    }
    async createCheckoutSession(userId, tier) {
        if (tier === "FREE") throw new Error('Cannot create checkout for free tier');
        const user = await this.firestore.findUnique('users', userId);
        if (!user || !user.email) throw new Error('User not found or missing email');
        const pricing = this.PRICING[tier];
        if (!pricing || !pricing.priceId) throw new Error('Price ID not configured');
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: {
                    userId
                }
            });
            customerId = customer.id;
            await this.firestore.update('users', userId, {
                stripeCustomerId: customerId
            });
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: pricing.priceId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing`,
            metadata: {
                userId,
                tier
            }
        });
        return {
            sessionId: session.id,
            url: session.url
        };
    }
    async handleSubscriptionWebhook(event) {
        switch(event.type){
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.syncSubscription(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.cancelSubscription(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
        }
    }
    async syncSubscription(stripeSub) {
        const userId = stripeSub.metadata.userId;
        if (!userId) return;
        const tier = stripeSub.metadata.tier || "PREMIUM_MONTHLY";
        await this.firestore.update('subscriptions', userId, {
            tier,
            status: stripeSub.status.toUpperCase(),
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer,
            currentPeriodStart: _firebaseadmin.firestore.Timestamp.fromMillis(stripeSub.current_period_start * 1000),
            currentPeriodEnd: _firebaseadmin.firestore.Timestamp.fromMillis(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        }, true);
    }
    async cancelSubscription(stripeSub) {
        const userId = stripeSub.metadata.userId;
        if (!userId) return;
        await this.firestore.update('subscriptions', userId, {
            status: 'CANCELED',
            canceledAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        });
    }
    async handlePaymentFailed(invoice) {
        const customerId = invoice.customer;
        const users = await this.firestore.findMany('users', (ref)=>ref.where('stripeCustomerId', '==', customerId));
        if (users.length > 0) {
            await this.firestore.update('subscriptions', users[0].id, {
                status: 'PAST_DUE'
            });
        }
    }
    async cancelAtPeriodEnd(userId) {
        const subscription = await this.firestore.findUnique('subscriptions', userId);
        if (!subscription || !subscription.stripeSubscriptionId) throw new Error('No active subscription');
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
        });
        await this.firestore.update('subscriptions', userId, {
            cancelAtPeriodEnd: true
        });
        return true;
    }
    async reactivateSubscription(userId) {
        const subscription = await this.firestore.findUnique('subscriptions', userId);
        if (!subscription || !subscription.stripeSubscriptionId) throw new Error('No subscription');
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false
        });
        await this.firestore.update('subscriptions', userId, {
            cancelAtPeriodEnd: false
        });
        return true;
    }
    async hasPremiumAccess(userId) {
        const status = await this.getSubscriptionStatus(userId);
        return status.tier !== "FREE" && status.status === 'ACTIVE';
    }
    constructor(firestore){
        this.firestore = firestore;
        this.PRICING = {
            ["STARTER_MONTHLY"]: {
                priceUSD: 4.99,
                priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID
            },
            ["STARTER_YEARLY"]: {
                priceUSD: 49.99,
                priceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID
            },
            ["PREMIUM_MONTHLY"]: {
                priceUSD: 7.99,
                priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
            },
            ["PREMIUM_YEARLY"]: {
                priceUSD: 74.99,
                priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
            },
            ["UNLIMITED_MONTHLY"]: {
                priceUSD: 12.99,
                priceId: process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID
            },
            ["UNLIMITED_YEARLY"]: {
                priceUSD: 129.99,
                priceId: process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID
            }
        };
        this.stripe = new _stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2023-10-16'
        });
    }
};
SubscriptionService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], SubscriptionService);
