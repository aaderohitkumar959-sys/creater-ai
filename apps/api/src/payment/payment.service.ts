import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { CoinService } from '../coin/coin.service';
import { AnalyticsService } from '../analytics/analytics.service';

const prisma = new PrismaClient();

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private razorpay: any;

  constructor(
    private coinService: CoinService,
    private analytics: AnalyticsService,
  ) {
    // Initialize Stripe
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
      {
        apiVersion: '2025-11-17.clover' as any,
      },
    );

    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
    });
  }

  async getCoinPacks() {
    return prisma.coinPack.findMany({
      where: { isActive: true },
      orderBy: { priceUSD: 'asc' },
    });
  }

  async createStripePaymentIntent(userId: string, coinPackId: string) {
    const coinPack = await prisma.coinPack.findUnique({
      where: { id: coinPackId },
    });

    if (!coinPack) {
      throw new Error('Coin pack not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(coinPack.priceUSD * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        coinPackId,
        coins: coinPack.coins + coinPack.bonusCoins,
      },
    });

    // Create payment record
    await prisma.payment.create({
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

  async createRazorpayOrder(userId: string, coinPackId: string) {
    const coinPack = await prisma.coinPack.findUnique({
      where: { id: coinPackId },
    });

    if (!coinPack) {
      throw new Error('Coin pack not found');
    }

    const order = await this.razorpay.orders.create({
      amount: Math.round(coinPack.priceINR * 100), // Convert to paise
      currency: 'INR',
      notes: {
        userId,
        coinPackId,
        coins: coinPack.coins + coinPack.bonusCoins,
      },
    });

    // Create payment record
    await prisma.payment.create({
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

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await this.fulfillPayment(paymentIntent.id, 'STRIPE');
    }

    return { received: true };
  }

  async handleRazorpayWebhook(signature: string, payload: any) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder';

    // Verify Razorpay signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Webhook signature verification failed');
    }

    if (payload.event === 'payment.captured') {
      await this.fulfillPayment(
        payload.payload.payment.entity.order_id,
        'RAZORPAY',
      );
    }

    return { received: true };
  }

  private async fulfillPayment(
    providerTxnId: string,
    provider: 'STRIPE' | 'RAZORPAY',
  ) {
    const payment = await prisma.payment.findFirst({
      where: { providerTxnId, provider },
    });

    if (!payment || payment.status === 'COMPLETED') {
      return; // Already fulfilled or not found
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' },
    });

    // Add coins to user wallet
    if (payment.coinsGranted) {
      await this.coinService.addCoins(
        payment.userId,
        payment.coinsGranted,
        `Purchased ${payment.coinsGranted} coins`,
        { paymentId: payment.id, provider },
      );
    }

    // Track purchase event
    await this.analytics.trackEvent(payment.userId, 'PURCHASE', {
      paymentId: payment.id,
      provider: payment.provider,
      amount: payment.amount,
      currency: payment.currency,
      coinsGranted: payment.coinsGranted,
    });
  }
}
