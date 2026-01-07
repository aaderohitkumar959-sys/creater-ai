"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentService", {
    enumerable: true,
    get: function() {
        return PaymentService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _stripe = /*#__PURE__*/ _interop_require_default(require("stripe"));
const _razorpay = /*#__PURE__*/ _interop_require_default(require("razorpay"));
const _coinservice = require("../coin/coin.service");
const _analyticsservice = require("../analytics/analytics.service");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
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
let PaymentService = class PaymentService {
    async getCoinPacks() {
        return this.firestore.findMany('coin_packs', (ref)=>ref.where('isActive', '==', true).orderBy('priceUSD', 'asc'));
    }
    async createStripePaymentIntent(userId, coinPackId) {
        const coinPack = await this.firestore.findUnique('coin_packs', coinPackId);
        if (!coinPack) {
            throw new Error('Coin pack not found');
        }
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(coinPack.priceUSD * 100),
            currency: 'usd',
            metadata: {
                userId,
                coinPackId,
                coins: (coinPack.coins || 0) + (coinPack.bonusCoins || 0)
            }
        });
        await this.firestore.create('payments', {
            userId,
            provider: 'STRIPE',
            amount: coinPack.priceUSD,
            currency: 'USD',
            status: 'PENDING',
            providerTxnId: paymentIntent.id,
            coinPackId,
            coinsGranted: (coinPack.coins || 0) + (coinPack.bonusCoins || 0)
        });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    }
    async createRazorpayOrder(userId, coinPackId) {
        const coinPack = await this.firestore.findUnique('coin_packs', coinPackId);
        if (!coinPack) {
            throw new Error('Coin pack not found');
        }
        const order = await this.razorpay.orders.create({
            amount: Math.round(coinPack.priceINR * 100),
            currency: 'INR',
            notes: {
                userId,
                coinPackId,
                coins: (coinPack.coins || 0) + (coinPack.bonusCoins || 0)
            }
        });
        await this.firestore.create('payments', {
            userId,
            provider: 'RAZORPAY',
            amount: coinPack.priceINR,
            currency: 'INR',
            status: 'PENDING',
            providerTxnId: order.id,
            coinPackId,
            coinsGranted: (coinPack.coins || 0) + (coinPack.bonusCoins || 0)
        });
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        };
    }
    async handleStripeWebhook(signature, payload) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err) {
            throw new Error(`Webhook signature verification failed: ${err.message}`);
        }
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            await this.fulfillPayment(paymentIntent.id, 'STRIPE');
        }
        return {
            received: true
        };
    }
    async handleRazorpayWebhook(signature, payload) {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder';
        const crypto = require('crypto');
        const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(payload)).digest('hex');
        if (signature !== expectedSignature) {
            throw new Error('Webhook signature verification failed');
        }
        if (payload.event === 'payment.captured') {
            await this.fulfillPayment(payload.payload.payment.entity.order_id, 'RAZORPAY');
        }
        return {
            received: true
        };
    }
    async fulfillPayment(providerTxnId, provider) {
        await this.firestore.runTransaction(async (transaction)=>{
            const paymentsRef = this.firestore.collection('payments');
            const snapshot = await paymentsRef.where('providerTxnId', '==', providerTxnId).where('provider', '==', provider).limit(1).get();
            if (snapshot.empty) return;
            const paymentDoc = snapshot.docs[0];
            const paymentData = paymentDoc.data();
            if (paymentData.status === 'COMPLETED') return;
            transaction.update(paymentDoc.ref, {
                status: 'COMPLETED',
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
            if (paymentData.coinPackId?.startsWith('msg-pack')) {
                const credits = paymentData.coinsGranted || 500;
                transaction.update(this.firestore.collection('users').doc(paymentData.userId), {
                    paidMessageCredits: _firebaseadmin.firestore.FieldValue.increment(credits)
                });
            } else if (paymentData.coinsGranted) {
                await this.coinService.addCoins(paymentData.userId, paymentData.coinsGranted, `Purchased ${paymentData.coinsGranted} coins`, {
                    paymentId: paymentDoc.id,
                    provider
                });
            }
        });
        return {
            success: true
        };
    }
    constructor(firestore, coinService, analytics){
        this.firestore = firestore;
        this.coinService = coinService;
        this.analytics = analytics;
        this.stripe = new _stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2023-10-16'
        });
        this.razorpay = new _razorpay.default({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
        });
    }
};
PaymentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _coinservice.CoinService === "undefined" ? Object : _coinservice.CoinService,
        typeof _analyticsservice.AnalyticsService === "undefined" ? Object : _analyticsservice.AnalyticsService
    ])
], PaymentService);
