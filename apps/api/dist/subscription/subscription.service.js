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
exports.SubscriptionService = exports.SubscriptionTier = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = __importDefault(require("stripe"));
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "FREE";
    SubscriptionTier["STARTER_MONTHLY"] = "STARTER_MONTHLY";
    SubscriptionTier["STARTER_YEARLY"] = "STARTER_YEARLY";
    SubscriptionTier["PREMIUM_MONTHLY"] = "PREMIUM_MONTHLY";
    SubscriptionTier["PREMIUM_YEARLY"] = "PREMIUM_YEARLY";
    SubscriptionTier["UNLIMITED_MONTHLY"] = "UNLIMITED_MONTHLY";
    SubscriptionTier["UNLIMITED_YEARLY"] = "UNLIMITED_YEARLY";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
let SubscriptionService = class SubscriptionService {
    prisma;
    stripe;
    PRICING = {
        [SubscriptionTier.STARTER_MONTHLY]: {
            priceUSD: 4.99,
            priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
        },
        [SubscriptionTier.STARTER_YEARLY]: {
            priceUSD: 49.99,
            priceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
        },
        [SubscriptionTier.PREMIUM_MONTHLY]: {
            priceUSD: 7.99,
            priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        },
        [SubscriptionTier.PREMIUM_YEARLY]: {
            priceUSD: 74.99,
            priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
        },
        [SubscriptionTier.UNLIMITED_MONTHLY]: {
            priceUSD: 12.99,
            priceId: process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID,
        },
        [SubscriptionTier.UNLIMITED_YEARLY]: {
            priceUSD: 129.99,
            priceId: process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID,
        },
    };
    constructor(prisma) {
        this.prisma = prisma;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-11-17.clover',
        });
    }
    getBenefits(tier) {
        const benefits = {
            [SubscriptionTier.FREE]: {
                messagesPerDay: 50,
                hasLongTermMemory: false,
                priorityAI: false,
                adFree: false,
                earlyAccess: false,
            },
            [SubscriptionTier.STARTER_MONTHLY]: {
                messagesPerDay: 200,
                hasLongTermMemory: true,
                priorityAI: false,
                adFree: true,
                earlyAccess: false,
            },
            [SubscriptionTier.STARTER_YEARLY]: {
                messagesPerDay: 200,
                hasLongTermMemory: true,
                priorityAI: false,
                adFree: true,
                earlyAccess: false,
            },
            [SubscriptionTier.PREMIUM_MONTHLY]: {
                messagesPerDay: 500,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true,
            },
            [SubscriptionTier.PREMIUM_YEARLY]: {
                messagesPerDay: 500,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true,
            },
            [SubscriptionTier.UNLIMITED_MONTHLY]: {
                messagesPerDay: 999999,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true,
            },
            [SubscriptionTier.UNLIMITED_YEARLY]: {
                messagesPerDay: 999999,
                hasLongTermMemory: true,
                priorityAI: true,
                adFree: true,
                earlyAccess: true,
            },
        };
        return benefits[tier];
    }
    async getSubscriptionStatus(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription || subscription.status !== 'ACTIVE') {
            return {
                tier: SubscriptionTier.FREE,
                status: 'FREE',
                benefits: this.getBenefits(SubscriptionTier.FREE),
            };
        }
        const tier = subscription.tier;
        return {
            tier,
            status: subscription.status,
            benefits: this.getBenefits(tier),
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        };
    }
    async createCheckoutSession(userId, tier) {
        if (tier === SubscriptionTier.FREE) {
            throw new Error('Cannot create checkout for free tier');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.email) {
            throw new Error('User not found or missing email');
        }
        const pricing = this.PRICING[tier];
        if (!pricing || !pricing.priceId) {
            throw new Error('Price ID not configured for tier: ' + tier);
        }
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId },
            });
            customerId = customer.id;
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: pricing.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing`,
            metadata: {
                userId,
                tier,
            },
        });
        return {
            sessionId: session.id,
            url: session.url,
        };
    }
    async handleSubscriptionWebhook(event) {
        console.log('[SUBSCRIPTION] Webhook received:', event.type);
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.syncSubscription(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.cancelSubscription(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                console.log('[SUBSCRIPTION] Payment succeeded');
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log('[SUBSCRIPTION] Unhandled event type:', event.type);
        }
    }
    async syncSubscription(stripeSubscription) {
        const userId = stripeSubscription.metadata.userId;
        if (!userId) {
            console.error('[SUBSCRIPTION] Missing userId in metadata');
            return;
        }
        const tier = (stripeSubscription.metadata.tier ||
            'PREMIUM_MONTHLY');
        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                tier,
                plan: tier,
                status: stripeSubscription.status.toUpperCase(),
                stripeSubscriptionId: stripeSubscription.id,
                stripeCustomerId: stripeSubscription.customer,
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                endDate: new Date(stripeSubscription.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            },
            update: {
                tier,
                status: stripeSubscription.status.toUpperCase(),
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            },
        });
        console.log('[SUBSCRIPTION] Synced:', { userId, tier });
    }
    async cancelSubscription(stripeSubscription) {
        const userId = stripeSubscription.metadata.userId;
        if (!userId)
            return;
        await this.prisma.subscription.update({
            where: { userId },
            data: {
                status: 'CANCELED',
                canceledAt: new Date(),
            },
        });
        console.log('[SUBSCRIPTION] Canceled:', userId);
    }
    async handlePaymentFailed(invoice) {
        const customerId = invoice.customer;
        const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (user) {
            console.log('[SUBSCRIPTION] Payment failed for user:', user.id);
            await this.prisma.subscription.updateMany({
                where: { userId: user.id },
                data: { status: 'PAST_DUE' },
            });
        }
    }
    async cancelAtPeriodEnd(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription || !subscription.stripeSubscriptionId) {
            throw new Error('No active subscription found');
        }
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
        await this.prisma.subscription.update({
            where: { userId },
            data: { cancelAtPeriodEnd: true },
        });
        console.log('[SUBSCRIPTION] Marked for cancellation:', userId);
        return true;
    }
    async reactivateSubscription(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription || !subscription.stripeSubscriptionId) {
            throw new Error('No subscription found');
        }
        if (!subscription.cancelAtPeriodEnd) {
            throw new Error('Subscription is not scheduled for cancellation');
        }
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
        });
        await this.prisma.subscription.update({
            where: { userId },
            data: { cancelAtPeriodEnd: false },
        });
        console.log('[SUBSCRIPTION] Reactivated:', userId);
        return true;
    }
    async hasPremiumAccess(userId) {
        const status = await this.getSubscriptionStatus(userId);
        return status.tier !== SubscriptionTier.FREE && status.status === 'ACTIVE';
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
