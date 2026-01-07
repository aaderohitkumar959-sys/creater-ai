import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { CoinService } from '../coin/coin.service';
import { AnalyticsService } from '../analytics/analytics.service';
import * as admin from 'firebase-admin';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private razorpay: any;

  constructor(
    private firestore: FirestoreService,
    private coinService: CoinService,
    private analytics: AnalyticsService,
  ) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
      {
        apiVersion: '2023-10-16' as any,
      },
    );

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
    });
  }

  async getCoinPacks() {
    return this.firestore.findMany('coin_packs', (ref) =>
      ref.where('isActive', '==', true).orderBy('priceUSD', 'asc')
    );
  }

  async createStripePaymentIntent(userId: string, coinPackId: string) {
    const coinPack = await this.firestore.findUnique('coin_packs', coinPackId) as any;

    if (!coinPack) {
      throw new Error('Coin pack not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(coinPack.priceUSD * 100),
      currency: 'usd',
      metadata: {
        userId,
        coinPackId,
        coins: (coinPack.coins || 0) + (coinPack.bonusCoins || 0),
      },
    });

    await this.firestore.create('payments', {
      userId,
      provider: 'STRIPE',
      amount: coinPack.priceUSD,
      currency: 'USD',
      status: 'PENDING',
      providerTxnId: paymentIntent.id,
      coinPackId,
      coinsGranted: (coinPack.coins || 0) + (coinPack.bonusCoins || 0),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async createRazorpayOrder(userId: string, coinPackId: string) {
    const coinPack = await this.firestore.findUnique('coin_packs', coinPackId) as any;

    if (!coinPack) {
      throw new Error('Coin pack not found');
    }

    const order = await this.razorpay.orders.create({
      amount: Math.round(coinPack.priceINR * 100),
      currency: 'INR',
      notes: {
        userId,
        coinPackId,
        coins: (coinPack.coins || 0) + (coinPack.bonusCoins || 0),
      },
    });

    await this.firestore.create('payments', {
      userId,
      provider: 'RAZORPAY',
      amount: coinPack.priceINR,
      currency: 'INR',
      status: 'PENDING',
      providerTxnId: order.id,
      coinPackId,
      coinsGranted: (coinPack.coins || 0) + (coinPack.bonusCoins || 0),
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.fulfillPayment(paymentIntent.id, 'STRIPE');
    }

    return { received: true };
  }

  async handleRazorpayWebhook(signature: string, payload: any) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder';
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Webhook signature verification failed');
    }

    if (payload.event === 'payment.captured') {
      await this.fulfillPayment(payload.payload.payment.entity.order_id, 'RAZORPAY');
    }

    return { received: true };
  }

  async fulfillPayment(providerTxnId: string, provider: string) {
    await this.firestore.runTransaction(async (transaction) => {
      const paymentsRef = this.firestore.collection('payments');
      const snapshot = await paymentsRef.where('providerTxnId', '==', providerTxnId)
        .where('provider', '==', provider)
        .limit(1)
        .get();

      if (snapshot.empty) return;
      const paymentDoc = snapshot.docs[0];
      const paymentData = paymentDoc.data() as any;

      if (paymentData.status === 'COMPLETED') return;

      transaction.update(paymentDoc.ref, {
        status: 'COMPLETED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (paymentData.coinPackId?.startsWith('msg-pack')) {
        const credits = paymentData.coinsGranted || 500;
        transaction.update(this.firestore.collection('users').doc(paymentData.userId), {
          paidMessageCredits: admin.firestore.FieldValue.increment(credits),
        });
      } else if (paymentData.coinsGranted) {
        await this.coinService.addCoins(
          paymentData.userId,
          paymentData.coinsGranted,
          `Purchased ${paymentData.coinsGranted} coins`,
          { paymentId: paymentDoc.id, provider }
        );
      }
    });

    return { success: true };
  }
}
