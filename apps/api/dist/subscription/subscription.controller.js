"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SubscriptionController = class SubscriptionController {
    subscriptionService;
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getStatus(req) {
        const userId = req.user.id;
        return await this.subscriptionService.getSubscriptionStatus(userId);
    }
    getTiers() {
        return [
            {
                tier: subscription_service_1.SubscriptionTier.FREE,
                name: 'Free',
                price: 0,
                interval: null,
                benefits: this.subscriptionService.getBenefits(subscription_service_1.SubscriptionTier.FREE),
            },
            {
                tier: subscription_service_1.SubscriptionTier.PREMIUM_MONTHLY,
                name: 'Premium',
                price: 9.99,
                interval: 'month',
                benefits: this.subscriptionService.getBenefits(subscription_service_1.SubscriptionTier.PREMIUM_MONTHLY),
            },
            {
                tier: subscription_service_1.SubscriptionTier.PREMIUM_YEARLY,
                name: 'Premium Annual',
                price: 99.99,
                interval: 'year',
                savings: '16% off',
                benefits: this.subscriptionService.getBenefits(subscription_service_1.SubscriptionTier.PREMIUM_YEARLY),
            },
        ];
    }
    async createCheckout(req, body) {
        const userId = req.user.id;
        const { tier } = body;
        const session = await this.subscriptionService.createCheckoutSession(userId, tier);
        return {
            sessionId: session.sessionId,
            url: session.url,
        };
    }
    async cancel(req) {
        const userId = req.user.id;
        await this.subscriptionService.cancelAtPeriodEnd(userId);
        return {
            message: 'Your subscription will be canceled at the end of the current billing period',
        };
    }
    async reactivate(req) {
        const userId = req.user.id;
        await this.subscriptionService.reactivateSubscription(userId);
        return {
            message: 'Your subscription has been reactivated',
        };
    }
    async handleWebhook(signature, req) {
        const payload = req.rawBody;
        if (!payload) {
            throw new Error('Missing raw body');
        }
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            await this.subscriptionService.handleSubscriptionWebhook(event);
            return { received: true };
        }
        catch (err) {
            console.error('[SUBSCRIPTION] Webhook error:', err.message);
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('tiers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "getTiers", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)('reactivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "handleWebhook", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
