import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';

import { RedemptionService } from './redemption.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly redemptionService: RedemptionService,
  ) { }

  @Get('coin-packs')
  async getCoinPacks() {
    return this.paymentService.getCoinPacks();
  }

  @Post('stripe/create-intent')
  async createStripeIntent(
    @Body() body: { userId: string; coinPackId: string },
  ) {
    return this.paymentService.createStripePaymentIntent(
      body.userId,
      body.coinPackId,
    );
  }

  @Post('razorpay/create-order')
  async createRazorpayOrder(
    @Body() body: { userId: string; coinPackId: string },
  ) {
    return this.paymentService.createRazorpayOrder(
      body.userId,
      body.coinPackId,
    );
  }

  @Post('stripe/webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    const payload = req.rawBody;
    if (!payload) {
      throw new Error('Missing raw body');
    }
    return this.paymentService.handleStripeWebhook(signature, payload);
  }

  @Post('razorpay/webhook')
  async razorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    return this.paymentService.handleRazorpayWebhook(signature, body);
  }

  @Post('paypal/webhook')
  async paypalWebhook(@Headers() headers: any, @Body() body: any) {
    return this.paymentService.handlePayPalWebhook(headers, body);
  }

  @Post('verify-paypal')
  async verifyPaypal(@Body() body: { userId: string; paypalTxnId: string }) {
    return this.paymentService.verifyPayPalPayment(body.userId, body.paypalTxnId);
  }

  @Post('redeem')
  async redeemCode(@Body() body: { userId: string; code: string }) {
    return this.redemptionService.redeemCode(body.userId, body.code);
  }

  /**
   * Admin-only or internally used to generate codes for PayPal sales
   */
  @Post('admin/generate-code')
  async generateCode(@Body() body: { amount?: number }) {
    // In a production app, this would be guarded by an AdminGuard
    return {
      code: await this.redemptionService.generateCode(body.amount || 500),
    };
  }
}
