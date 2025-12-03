export interface CoinPack {
    id: string;
    name: string;
    description: string;
    priceUSD: number;
    priceINR: number;
    coins: number;
    bonusCoins: number;
    isActive: boolean;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
}

export interface RazorpayOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
}
