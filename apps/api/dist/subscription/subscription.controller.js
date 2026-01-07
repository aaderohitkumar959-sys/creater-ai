"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubscriptionController", {
    enumerable: true,
    get: function() {
        return SubscriptionController;
    }
});
const _common = require("@nestjs/common");
const _subscriptionservice = require("./subscription.service");
const _jwtauthguard = require("../auth/jwt-auth.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let SubscriptionController = class SubscriptionController {
    /**
     * Get current subscription status
     */ async getStatus(req) {
        const userId = req.user.id;
        return await this.subscriptionService.getSubscriptionStatus(userId);
    }
    /**
     * Get available subscription tiers and pricing
     */ getTiers() {
        return [
            {
                tier: _subscriptionservice.SubscriptionTier.FREE,
                name: 'Free',
                price: 0,
                interval: null,
                benefits: this.subscriptionService.getBenefits(_subscriptionservice.SubscriptionTier.FREE)
            },
            {
                tier: _subscriptionservice.SubscriptionTier.PREMIUM_MONTHLY,
                name: 'Premium',
                price: 9.99,
                interval: 'month',
                benefits: this.subscriptionService.getBenefits(_subscriptionservice.SubscriptionTier.PREMIUM_MONTHLY)
            },
            {
                tier: _subscriptionservice.SubscriptionTier.PREMIUM_YEARLY,
                name: 'Premium Annual',
                price: 99.99,
                interval: 'year',
                savings: '16% off',
                benefits: this.subscriptionService.getBenefits(_subscriptionservice.SubscriptionTier.PREMIUM_YEARLY)
            }
        ];
    }
    /**
     * Create checkout session for subscription
     */ async createCheckout(req, body) {
        const userId = req.user.id;
        const { tier } = body;
        const session = await this.subscriptionService.createCheckoutSession(userId, tier);
        return {
            sessionId: session.sessionId,
            url: session.url
        };
    }
    /**
     * Cancel subscription at period end
     */ async cancel(req) {
        const userId = req.user.id;
        await this.subscriptionService.cancelAtPeriodEnd(userId);
        return {
            message: 'Your subscription will be canceled at the end of the current billing period'
        };
    }
    /**
     * Reactivate canceled subscription
     */ async reactivate(req) {
        const userId = req.user.id;
        await this.subscriptionService.reactivateSubscription(userId);
        return {
            message: 'Your subscription has been reactivated'
        };
    }
    /**
     * Stripe webhook for subscription events
     */ async handleWebhook(signature, req) {
        const payload = req.rawBody;
        if (!payload) {
            throw new Error('Missing raw body');
        }
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            await this.subscriptionService.handleSubscriptionWebhook(event);
            return {
                received: true
            };
        } catch (err) {
            console.error('[SUBSCRIPTION] Webhook error:', err.message);
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }
    constructor(subscriptionService){
        this.subscriptionService = subscriptionService;
    }
};
_ts_decorate([
    (0, _common.Get)('status'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getStatus", null);
_ts_decorate([
    (0, _common.Get)('tiers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], SubscriptionController.prototype, "getTiers", null);
_ts_decorate([
    (0, _common.Post)('checkout'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createCheckout", null);
_ts_decorate([
    (0, _common.Post)('cancel'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Post)('reactivate'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SubscriptionController.prototype, "reactivate", null);
_ts_decorate([
    (0, _common.Post)('webhook'),
    _ts_param(0, (0, _common.Headers)('stripe-signature')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SubscriptionController.prototype, "handleWebhook", null);
SubscriptionController = _ts_decorate([
    (0, _common.Controller)('subscription'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _subscriptionservice.SubscriptionService === "undefined" ? Object : _subscriptionservice.SubscriptionService
    ])
], SubscriptionController);
