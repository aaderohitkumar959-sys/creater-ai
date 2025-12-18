import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    getCoinPacks(): Promise<{
        id: string;
        name: string;
        coins: number;
        createdAt: Date;
        updatedAt: Date;
        bonusCoins: number;
        priceUSD: number;
        priceINR: number;
        isActive: boolean;
    }[]>;
    createStripeIntent(body: {
        userId: string;
        coinPackId: string;
    }): Promise<{
        clientSecret: string | null;
        paymentIntentId: string;
    }>;
    createRazorpayOrder(body: {
        userId: string;
        coinPackId: string;
    }): Promise<{
        orderId: any;
        amount: any;
        currency: any;
    }>;
    stripeWebhook(signature: string, req: any): Promise<{
        received: boolean;
    }>;
    razorpayWebhook(signature: string, body: any): Promise<{
        received: boolean;
    }>;
}
