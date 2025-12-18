import { PrismaService } from '../prisma/prisma.service';
import { CoinService } from '../coin/coin.service';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class PaymentService {
    private prisma;
    private coinService;
    private analytics;
    private stripe;
    private razorpay;
    constructor(prisma: PrismaService, coinService: CoinService, analytics: AnalyticsService);
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
    createStripePaymentIntent(userId: string, coinPackId: string): Promise<{
        clientSecret: string | null;
        paymentIntentId: string;
    }>;
    createRazorpayOrder(userId: string, coinPackId: string): Promise<{
        orderId: any;
        amount: any;
        currency: any;
    }>;
    handleStripeWebhook(signature: string, payload: Buffer): Promise<{
        received: boolean;
    }>;
    handleRazorpayWebhook(signature: string, payload: any): Promise<{
        received: boolean;
    }>;
    private fulfillPayment;
    refundPayment(paymentId: string, reason: string, adminUserId: string): Promise<boolean>;
}
