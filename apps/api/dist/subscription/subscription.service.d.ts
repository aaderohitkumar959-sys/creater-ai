import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
export declare enum SubscriptionTier {
    FREE = "FREE",
    STARTER_MONTHLY = "STARTER_MONTHLY",
    STARTER_YEARLY = "STARTER_YEARLY",
    PREMIUM_MONTHLY = "PREMIUM_MONTHLY",
    PREMIUM_YEARLY = "PREMIUM_YEARLY",
    UNLIMITED_MONTHLY = "UNLIMITED_MONTHLY",
    UNLIMITED_YEARLY = "UNLIMITED_YEARLY"
}
export interface SubscriptionBenefits {
    messagesPerDay: number;
    hasLongTermMemory: boolean;
    priorityAI: boolean;
    adFree: boolean;
    earlyAccess: boolean;
}
export declare class SubscriptionService {
    private prisma;
    private stripe;
    private readonly PRICING;
    constructor(prisma: PrismaService);
    getBenefits(tier: SubscriptionTier): SubscriptionBenefits;
    getSubscriptionStatus(userId: string): Promise<{
        tier: SubscriptionTier;
        status: string;
        benefits: SubscriptionBenefits;
        currentPeriodEnd?: undefined;
        cancelAtPeriodEnd?: undefined;
    } | {
        tier: SubscriptionTier;
        status: string;
        benefits: SubscriptionBenefits;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
    }>;
    createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<{
        sessionId: string;
        url: string;
    }>;
    handleSubscriptionWebhook(event: Stripe.Event): Promise<void>;
    private syncSubscription;
    private cancelSubscription;
    private handlePaymentFailed;
    cancelAtPeriodEnd(userId: string): Promise<boolean>;
    reactivateSubscription(userId: string): Promise<boolean>;
    hasPremiumAccess(userId: string): Promise<boolean>;
}
