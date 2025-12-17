import { Controller, Post, Get, Delete, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { SubscriptionService, SubscriptionTier } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscription')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) { }

    /**
     * Get current subscription status
     */
    @Get('status')
    @UseGuards(JwtAuthGuard)
    async getStatus(@Req() req: any) {
        const userId = req.user.id;
        return await this.subscriptionService.getSubscriptionStatus(userId);
    }

    /**
     * Get available subscription tiers and pricing
     */
    @Get('tiers')
    getTiers() {
        return [
            {
                tier: SubscriptionTier.FREE,
                name: 'Free',
                price: 0,
                interval: null,
                benefits: this.subscriptionService.getBenefits(SubscriptionTier.FREE),
            },
            {
                tier: SubscriptionTier.PREMIUM_MONTHLY,
                name: 'Premium',
                price: 9.99,
                interval: 'month',
                benefits: this.subscriptionService.getBenefits(
                    SubscriptionTier.PREMIUM_MONTHLY,
                ),
            },
            {
                tier: SubscriptionTier.PREMIUM_YEARLY,
                name: 'Premium Annual',
                price: 99.99,
                interval: 'year',
                savings: '16% off',
                benefits: this.subscriptionService.getBenefits(
                    SubscriptionTier.PREMIUM_YEARLY,
                ),
            },
        ];
    }

    /**
     * Create checkout session for subscription
     */
    @Post('checkout')
    @UseGuards(JwtAuthGuard)
    async createCheckout(
        @Req() req: any,
        @Body() body: { tier: SubscriptionTier },
    ) {
        const userId = req.user.id;
        const { tier } = body;

        const session = await this.subscriptionService.createCheckoutSession(
            userId,
            tier,
        );

        return {
            sessionId: session.sessionId,
            url: session.url,
        };
    }

    /**
     * Cancel subscription at period end
     */
    @Post('cancel')
    @UseGuards(JwtAuthGuard)
    async cancel(@Req() req: any) {
        const userId = req.user.id;
        await this.subscriptionService.cancelAtPeriodEnd(userId);

        return {
            message:
                'Your subscription will be canceled at the end of the current billing period',
        };
    }

    /**
     * Reactivate canceled subscription
     */
    @Post('reactivate')
    @UseGuards(JwtAuthGuard)
    async reactivate(@Req() req: any) {
        const userId = req.user.id;
        await this.subscriptionService.reactivateSubscription(userId);

        return {
            message: 'Your subscription has been reactivated',
        };
    }

    /**
     * Stripe webhook for subscription events
     */
    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: any,
    ) {
        const payload = req.rawBody;
        if (!payload) {
            throw new Error('Missing raw body');
        }

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;

        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret,
            );

            await this.subscriptionService.handleSubscriptionWebhook(event);

            return { received: true };
        } catch (err: any) {
            console.error('[SUBSCRIPTION] Webhook error:', err.message);
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }
}
