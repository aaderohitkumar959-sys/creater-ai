import { SubscriptionService, SubscriptionTier } from './subscription.service';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getStatus(req: any): Promise<{
        tier: SubscriptionTier;
        status: string;
        benefits: import("./subscription.service").SubscriptionBenefits;
        currentPeriodEnd?: undefined;
        cancelAtPeriodEnd?: undefined;
    } | {
        tier: SubscriptionTier;
        status: string;
        benefits: import("./subscription.service").SubscriptionBenefits;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
    }>;
    getTiers(): ({
        tier: SubscriptionTier;
        name: string;
        price: number;
        interval: null;
        benefits: import("./subscription.service").SubscriptionBenefits;
        savings?: undefined;
    } | {
        tier: SubscriptionTier;
        name: string;
        price: number;
        interval: string;
        benefits: import("./subscription.service").SubscriptionBenefits;
        savings?: undefined;
    } | {
        tier: SubscriptionTier;
        name: string;
        price: number;
        interval: string;
        savings: string;
        benefits: import("./subscription.service").SubscriptionBenefits;
    })[];
    createCheckout(req: any, body: {
        tier: SubscriptionTier;
    }): Promise<{
        sessionId: string;
        url: string;
    }>;
    cancel(req: any): Promise<{
        message: string;
    }>;
    reactivate(req: any): Promise<{
        message: string;
    }>;
    handleWebhook(signature: string, req: any): Promise<{
        received: boolean;
    }>;
}
