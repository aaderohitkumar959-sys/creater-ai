import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { CoinService } from '../coin/coin.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private razorpay: any;

  constructor(
    private prisma: PrismaService, // FIXED: Use injected PrismaService
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
    return this.prisma.coinPack.findMany({
      where: { isActive: true },
      orderBy: { priceUSD: 'asc' },
    });
  }

  async createStripePaymentIntent(userId: string, coinPackId: string) {
    const coinPack = await this.prisma.coinPack.findUnique({
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

  async createRazorpayOrder(userId: string, coinPackId: string) {
    const coinPack = await this.prisma.coinPack.findUnique({
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

  /**
   * Handle Stripe webhook with signature verification
   * FIXED: Now uses database transactions for idempotency
   */
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
      console.error('[WEBHOOK] Stripe signature verification failed:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('[WEBHOOK] Stripe event received:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.fulfillPayment(paymentIntent.id, 'STRIPE');
    }

    return { received: true };
  }

  /**
   * Handle Razorpay webhook with signature verification
   * FIXED: Now uses database transactions for idempotency
   */
  async handleRazorpayWebhook(signature: string, payload: any) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder';

    // Verify Razorpay signature
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
      await this.fulfillPayment(
        payload.payload.payment.entity.order_id,
        'RAZORPAY',
      );
    }

    return { received: true };
  }

  /**
   * Fulfill payment and grant coins
   * FIXED: Uses database transaction for idempotency
   * Prevents duplicate coin grants on webhook replays
   */
  private async fulfillPayment(
    providerTxnId: string,
    provider: 'STRIPE' | 'RAZORPAY',
  ) {
    console.log('[PAYMENT] Fulfilling payment:', { providerTxnId, provider });

    // FIXED: Use transaction for idempotency
    try {
      await this.prisma.$transaction(async (tx) => {
        // Find payment record
        const payment = await tx.payment.findFirst({
          where: { providerTxnId, provider },
        });

        if (!payment) {
          console.warn('[PAYMENT] Payment record not found:', providerTxnId);
          return;
        }

        if (payment.status === 'COMPLETED') {
          console.log('[PAYMENT] Already fulfilled, skipping:', payment.id);
          return; // Idempotency: Already processed
        }

        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            updatedAt: new Date(),
          },
        });

        // Grant coins to user (this is also a transaction)
        if (payment.coinsGranted) {
          await this.coinService.addCoins(
            payment.userId,
            payment.coinsGranted,
            `Purchased ${payment.coinsGranted} coins`,
            { paymentId: payment.id, provider },
          );
        }

        console.log('[PAYMENT] Fulfilled successfully:', {
          paymentId: payment.id,
          userId: payment.userId,
          coins: payment.coinsGranted,
        });
      }, {
        isolationLevel: 'Serializable', // Prevent race conditions
      });

      // Track analytics (outside transaction, non-critical)
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
          // Don't throw - analytics failure shouldn't stop payment
        });
      }
    } catch (error) {
      console.error('[PAYMENT] Error fulfilling payment:', {
        error: error.message,
        providerTxnId,
        provider,
      });
      throw error;
    }
  }

  /**
   * Admin refund functionality
   * Deducts coins and marks payment as refunded
   */
  async refundPayment(
    paymentId: string,
    reason: string,
    adminUserId: string,
  ): Promise<boolean> {
    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || payment.status !== 'COMPLETED') {
        throw new Error('Payment not found or not completed');
      }

      // Deduct coins from user
      if (payment.coinsGranted) {
        const balance = await this.coinService.getBalance(payment.userId);

        if (balance < payment.coinsGranted) {
          throw new Error('Insufficient coins for refund');
        }

        await this.coinService.deductCoins(
          payment.userId,
          payment.coinsGranted,
          `Refund: ${reason}`,
          { paymentId, adminUserId, reason },
        );
      }

      // Update payment status
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
}
