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

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
}
