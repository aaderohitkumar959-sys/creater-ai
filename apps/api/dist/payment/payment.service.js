"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = __importDefault(require("stripe"));
const razorpay_1 = __importDefault(require("razorpay"));
const coin_service_1 = require("../coin/coin.service");
const analytics_service_1 = require("../analytics/analytics.service");
let PaymentService = class PaymentService {
    prisma;
    coinService;
    analytics;
    stripe;
    razorpay;
    constructor(prisma, coinService, analytics) {
        this.prisma = prisma;
        this.coinService = coinService;
        this.analytics = analytics;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-11-17.clover',
        });
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
        });
    }
    async getCoinPacks() {
        return this.prisma.coinPack.findMany({
            where: { isActive: true },
            orderBy: { priceUSD: 'asc' },
        });
    }
    async createStripePaymentIntent(userId, coinPackId) {
        const coinPack = await this.prisma.coinPack.findUnique({
            where: { id: coinPackId },
        });
        if (!coinPack) {
            throw new Error('Coin pack not found');
        }
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(coinPack.priceUSD * 100),
            currency: 'usd',
            metadata: {
                userId,
                coinPackId,
                coins: coinPack.coins + coinPack.bonusCoins,
            },
        });
        await this.prisma.payment.create({
            data: {
                userId,
                provider: 'STRIPE',
                amount: coinPack.priceUSD,
                currency: 'USD',
                status: 'PENDING',
                providerTxnId: paymentIntent.id,
                coinPackId,
                coinsGranted: coinPack.coins + coinPack.bonusCoins,
            },
        });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    }
    async createRazorpayOrder(userId, coinPackId) {
        const coinPack = await this.prisma.coinPack.findUnique({
            where: { id: coinPackId },
        });
        if (!coinPack) {
            throw new Error('Coin pack not found');
        }
        const order = await this.razorpay.orders.create({
            amount: Math.round(coinPack.priceINR * 100),
            currency: 'INR',
            notes: {
                userId,
                coinPackId,
                coins: coinPack.coins + coinPack.bonusCoins,
            },
        });
        await this.prisma.payment.create({
            data: {
                userId,
                provider: 'RAZORPAY',
                amount: coinPack.priceINR,
                currency: 'INR',
                status: 'PENDING',
                providerTxnId: order.id,
                coinPackId,
                coinsGranted: coinPack.coins + coinPack.bonusCoins,
            },
        });
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        };
    }
    async handleStripeWebhook(signature, payload) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            console.error('[WEBHOOK] Stripe signature verification failed:', err.message);
            throw new Error(`Webhook signature verification failed: ${err.message}`);
        }
        console.log('[WEBHOOK] Stripe event received:', event.type);
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            await this.fulfillPayment(paymentIntent.id, 'STRIPE');
        }
        return { received: true };
    }
    async handleRazorpayWebhook(signature, payload) {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder';
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        if (signature !== expectedSignature) {
            console.error('[WEBHOOK] Razorpay signature verification failed');
            throw new Error('Webhook signature verification failed');
        }
        console.log('[WEBHOOK] Razorpay event received:', payload.event);
        if (payload.event === 'payment.captured') {
            await this.fulfillPayment(payload.payload.payment.entity.order_id, 'RAZORPAY');
        }
        return { received: true };
    }
    async fulfillPayment(providerTxnId, provider) {
        console.log('[PAYMENT] Fulfilling payment:', { providerTxnId, provider });
        try {
            await this.prisma.$transaction(async (tx) => {
                const payment = await tx.payment.findFirst({
                    where: { providerTxnId, provider },
                });
                if (!payment) {
                    console.warn('[PAYMENT] Payment record not found:', providerTxnId);
                    return;
                }
                if (payment.status === 'COMPLETED') {
                    console.log('[PAYMENT] Already fulfilled, skipping:', payment.id);
                    return;
                }
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'COMPLETED',
                        updatedAt: new Date(),
                    },
                });
                if (payment.coinsGranted) {
                    await this.coinService.addCoins(payment.userId, payment.coinsGranted, `Purchased ${payment.coinsGranted} coins`, { paymentId: payment.id, provider });
                }
                console.log('[PAYMENT] Fulfilled successfully:', {
                    paymentId: payment.id,
                    userId: payment.userId,
                    coins: payment.coinsGranted,
                });
            }, {
                isolationLevel: 'Serializable',
            });
            const payment = await this.prisma.payment.findFirst({
                where: { providerTxnId, provider },
            });
            if (payment) {
                await this.analytics.trackEvent(payment.userId, 'PURCHASE', {
                    paymentId: payment.id,
                    provider: payment.provider,
                    amount: payment.amount,
                    currency: payment.currency,
                    coinsGranted: payment.coinsGranted,
                }).catch(error => {
                    console.error('[ANALYTICS] Failed to track event:', error);
                });
            }
        }
        catch (error) {
            console.error('[PAYMENT] Error fulfilling payment:', {
                error: error.message,
                providerTxnId,
                provider,
            });
            throw error;
        }
    }
    async refundPayment(paymentId, reason, adminUserId) {
        return await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
            });
            if (!payment || payment.status !== 'COMPLETED') {
                throw new Error('Payment not found or not completed');
            }
            if (payment.coinsGranted) {
                const balance = await this.coinService.getBalance(payment.userId);
                if (balance < payment.coinsGranted) {
                    throw new Error('Insufficient coins for refund');
                }
                await this.coinService.deductCoins(payment.userId, payment.coinsGranted, `Refund: ${reason}`, { paymentId, adminUserId, reason });
            }
            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'REFUNDED',
                    metadata: {
                        refundReason: reason,
                        refundedBy: adminUserId,
                        refundedAt: new Date().toISOString(),
                    },
                },
            });
            console.log('[REFUND] Payment refunded:', {
                paymentId,
                userId: payment.userId,
                coins: payment.coinsGranted,
                reason,
            });
            return true;
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        coin_service_1.CoinService,
        analytics_service_1.AnalyticsService])
], PaymentService);
