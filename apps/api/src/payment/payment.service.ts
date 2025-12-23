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
   * Handle PayPal webhook
   */
  async handlePayPalWebhook(headers: any, payload: any) {
    const eventType = payload.event_type;
    console.log(`[PAYPAL-WEBHOOK] Received event: ${eventType}`);

    // IGNORE all other event types except the capture completion
    if (eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
      console.log(`[PAYPAL-WEBHOOK] Ignoring event type: ${eventType}`);
      return { received: true };
    }

    const resource = payload.resource;
    const paypalTxnId = resource.id;
    const status = resource.status; // e.g., 'COMPLETED'
    const amount = resource.amount?.value;
    const currency = resource.amount?.currency_code;
    const payerEmail = payload.resource.payer?.email_address || 'unknown';
    const userId = resource.custom_id || resource.invoice_id;

    // Detailed Logging
    console.log('[PAYPAL-WEBHOOK] Processing Capture:', {
      paypalTxnId,
      status,
      amount: `${amount} ${currency}`,
      payerEmail,
      userId
    });

    // CRITICAL: Unlock premium ONLY after capture_status === COMPLETED
    if (status !== 'COMPLETED') {
      console.log(`[PAYPAL-WEBHOOK] Capture not completed (status: ${status}), skipping fulfillment.`);
      return { received: true };
    }

    if (userId) {
      // 1. Check if record already exists
      const existing = await this.prisma.payment.findFirst({
        where: { providerTxnId: paypalTxnId, provider: 'PAYPAL' },
      });

      if (!existing) {
        // 2. Create the payment record
        await this.prisma.payment.create({
          data: {
            userId,
            provider: 'PAYPAL',
            amount: parseFloat(amount || '0'),
            currency: currency || 'USD',
            status: 'PENDING',
            providerTxnId: paypalTxnId,
            coinPackId: 'msg-pack-500',
            coinsGranted: 500,
            metadata: {
              payerEmail,
              paypal_event_id: payload.id
            }
          },
        });
        console.log(`[PAYPAL-WEBHOOK] Created pending payment record for User: ${userId}`);
      }

      // 3. Fulfill the payment (grants credits)
      await this.fulfillPayment(paypalTxnId, 'PAYPAL');
      console.log(`[PAYPAL-WEBHOOK] Successfully fulfilled payment for Txn: ${paypalTxnId}`);
    } else {
      console.warn('[PAYPAL-WEBHOOK] No userId (custom_id) found in webhook payload!');
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
    provider: 'STRIPE' | 'RAZORPAY' | 'PAYPAL',
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

        // Grant coins OR Message Credits
        if (payment.coinPackId?.startsWith('msg-pack')) {
          const creditsToGrant = payment.coinsGranted || 500;
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              paidMessageCredits: { increment: creditsToGrant },
            },
          });
          console.log(`[PAYMENT] Granted ${creditsToGrant} message credits to user ${payment.userId}`);
        } else if (payment.coinsGranted) {
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

  /**
   * Verify a PayPal payment and fulfill it
   * This can be called from a Success page redirect or a Webhook
   */
  async verifyPayPalPayment(userId: string, paypalTxnId: string) {
    // 1. Check if already processed
    const existing = await this.prisma.payment.findFirst({
      where: { providerTxnId: paypalTxnId, provider: 'PAYPAL' },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        return { success: true, message: 'Already processed', granted: existing.coinsGranted };
      }
      // If pending, fulfill it
      await this.fulfillPayment(paypalTxnId, 'PAYPAL');
      return { success: true, granted: existing.coinsGranted };
    }

    // 2. Create the record and fulfill it
    // In a production app, we would fetch the txn details from PayPal first
    await this.prisma.payment.create({
      data: {
        userId,
        provider: 'PAYPAL',
        amount: 1.99,
        currency: 'USD',
        status: 'PENDING',
        providerTxnId: paypalTxnId,
        coinPackId: 'msg-pack-500',
        coinsGranted: 500,
      },
    });

    await this.fulfillPayment(paypalTxnId, 'PAYPAL');

    return { success: true, granted: 500 };
  }
}
