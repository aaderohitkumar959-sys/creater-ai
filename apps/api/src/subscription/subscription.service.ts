import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

export enum SubscriptionTier {
    FREE = 'FREE',
    STARTER_MONTHLY = 'STARTER_MONTHLY',
    STARTER_YEARLY = 'STARTER_YEARLY',
    PREMIUM_MONTHLY = 'PREMIUM_MONTHLY',
    PREMIUM_YEARLY = 'PREMIUM_YEARLY',
    UNLIMITED_MONTHLY = 'UNLIMITED_MONTHLY',
    UNLIMITED_YEARLY = 'UNLIMITED_YEARLY',
}

export interface SubscriptionBenefits {
    messagesPerDay: number;
    hasLongTermMemory: boolean;
    priorityAI: boolean;
    adFree: boolean;
    earlyAccess: boolean;
}

@Injectable()
export class SubscriptionService {
    private stripe: Stripe;

    private readonly PRICING = {
        [SubscriptionTier.STARTER_MONTHLY]: { priceUSD: 4.99, priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID },
        [SubscriptionTier.STARTER_YEARLY]: { priceUSD: 49.99, priceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID },
        [SubscriptionTier.PREMIUM_MONTHLY]: { priceUSD: 7.99, priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID },
        [SubscriptionTier.PREMIUM_YEARLY]: { priceUSD: 74.99, priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID },
        [SubscriptionTier.UNLIMITED_MONTHLY]: { priceUSD: 12.99, priceId: process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID },
        [SubscriptionTier.UNLIMITED_YEARLY]: { priceUSD: 129.99, priceId: process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID },
    };

    constructor(private firestore: FirestoreService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2023-10-16' as any,
        });
    }

    getBenefits(tier: SubscriptionTier): SubscriptionBenefits {
        const benefits: Record<SubscriptionTier, SubscriptionBenefits> = {
            [SubscriptionTier.FREE]: { messagesPerDay: 50, hasLongTermMemory: false, priorityAI: false, adFree: false, earlyAccess: false },
            [SubscriptionTier.STARTER_MONTHLY]: { messagesPerDay: 200, hasLongTermMemory: true, priorityAI: false, adFree: true, earlyAccess: false },
            [SubscriptionTier.STARTER_YEARLY]: { messagesPerDay: 200, hasLongTermMemory: true, priorityAI: false, adFree: true, earlyAccess: false },
            [SubscriptionTier.PREMIUM_MONTHLY]: { messagesPerDay: 500, hasLongTermMemory: true, priorityAI: true, adFree: true, earlyAccess: true },
            [SubscriptionTier.PREMIUM_YEARLY]: { messagesPerDay: 500, hasLongTermMemory: true, priorityAI: true, adFree: true, earlyAccess: true },
            [SubscriptionTier.UNLIMITED_MONTHLY]: { messagesPerDay: 999999, hasLongTermMemory: true, priorityAI: true, adFree: true, earlyAccess: true },
            [SubscriptionTier.UNLIMITED_YEARLY]: { messagesPerDay: 999999, hasLongTermMemory: true, priorityAI: true, adFree: true, earlyAccess: true },
        };
        return benefits[tier];
    }

    async getSubscriptionStatus(userId: string) {
        const subscription = await this.firestore.findUnique('subscriptions', userId) as any;

        if (!subscription || subscription.status !== 'ACTIVE') {
            return { tier: SubscriptionTier.FREE, status: 'FREE', benefits: this.getBenefits(SubscriptionTier.FREE) };
        }

        const tier = subscription.tier as SubscriptionTier;
        return {
            tier,
            status: subscription.status,
            benefits: this.getBenefits(tier),
            currentPeriodEnd: subscription.currentPeriodEnd?.toDate?.() || subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        };
    }

    async createCheckoutSession(userId: string, tier: SubscriptionTier) {
        if (tier === SubscriptionTier.FREE) throw new Error('Cannot create checkout for free tier');
        const user = await this.firestore.findUnique('users', userId) as any;
        if (!user || !user.email) throw new Error('User not found or missing email');

        const pricing = this.PRICING[tier];
        if (!pricing || !pricing.priceId) throw new Error('Price ID not configured');

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({ email: user.email, metadata: { userId } });
            customerId = customer.id;
            await this.firestore.update('users', userId, { stripeCustomerId: customerId });
        }

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: pricing.priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing`,
            metadata: { userId, tier },
        });

        return { sessionId: session.id, url: session.url! };
    }

    async handleSubscriptionWebhook(event: Stripe.Event) {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.syncSubscription(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.deleted':
                await this.cancelSubscription(event.data.object as Stripe.Subscription);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;
        }
    }

    private async syncSubscription(stripeSub: Stripe.Subscription) {
        const userId = stripeSub.metadata.userId;
        if (!userId) return;

        const tier = (stripeSub.metadata.tier || SubscriptionTier.PREMIUM_MONTHLY) as SubscriptionTier;

        await this.firestore.update('subscriptions', userId, {
            tier,
            status: stripeSub.status.toUpperCase(),
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer as string,
            currentPeriodStart: admin.firestore.Timestamp.fromMillis(stripeSub.current_period_start * 1000),
            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, true);
    }

    private async cancelSubscription(stripeSub: Stripe.Subscription) {
        const userId = stripeSub.metadata.userId;
        if (!userId) return;
        await this.firestore.update('subscriptions', userId, {
            status: 'CANCELED',
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    private async handlePaymentFailed(invoice: Stripe.Invoice) {
        const customerId = invoice.customer as string;
        const users = await this.firestore.findMany('users', (ref) => ref.where('stripeCustomerId', '==', customerId)) as any[];
        if (users.length > 0) {
            await this.firestore.update('subscriptions', users[0].id, { status: 'PAST_DUE' });
        }
    }

    async cancelAtPeriodEnd(userId: string) {
        const subscription = await this.firestore.findUnique('subscriptions', userId) as any;
        if (!subscription || !subscription.stripeSubscriptionId) throw new Error('No active subscription');

        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true });
        await this.firestore.update('subscriptions', userId, { cancelAtPeriodEnd: true });
        return true;
    }

    async reactivateSubscription(userId: string) {
        const subscription = await this.firestore.findUnique('subscriptions', userId) as any;
        if (!subscription || !subscription.stripeSubscriptionId) throw new Error('No subscription');

        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: false });
        await this.firestore.update('subscriptions', userId, { cancelAtPeriodEnd: false });
        return true;
    }

    async hasPremiumAccess(userId: string): Promise<boolean> {
        const status = await this.getSubscriptionStatus(userId);
        return status.tier !== SubscriptionTier.FREE && status.status === 'ACTIVE';
    }
}
