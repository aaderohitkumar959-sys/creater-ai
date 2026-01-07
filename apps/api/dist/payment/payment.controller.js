"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentController", {
    enumerable: true,
    get: function() {
        return PaymentController;
    }
});
const _common = require("@nestjs/common");
const _paymentservice = require("./payment.service");
const _redemptionservice = require("./redemption.service");
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
let PaymentController = class PaymentController {
    async getCoinPacks() {
        return this.paymentService.getCoinPacks();
    }
    async createStripeIntent(body) {
        return this.paymentService.createStripePaymentIntent(body.userId, body.coinPackId);
    }
    async createRazorpayOrder(body) {
        return this.paymentService.createRazorpayOrder(body.userId, body.coinPackId);
    }
    async stripeWebhook(signature, req) {
        const payload = req.rawBody;
        if (!payload) {
            throw new Error('Missing raw body');
        }
        return this.paymentService.handleStripeWebhook(signature, payload);
    }
    async razorpayWebhook(signature, body) {
        return this.paymentService.handleRazorpayWebhook(signature, body);
    }
    async paypalWebhook(headers, body) {
        return this.paymentService.handlePayPalWebhook(headers, body);
    }
    async verifyPaypal(body) {
        return this.paymentService.verifyPayPalPayment(body.userId, body.paypalTxnId);
    }
    async redeemCode(body) {
        return this.redemptionService.redeemCode(body.userId, body.code);
    }
    /**
   * Admin-only or internally used to generate codes for PayPal sales
   */ async generateCode(body) {
        // In a production app, this would be guarded by an AdminGuard
        return {
            code: await this.redemptionService.generateCode(body.amount || 500)
        };
    }
    constructor(paymentService, redemptionService){
        this.paymentService = paymentService;
        this.redemptionService = redemptionService;
    }
};
_ts_decorate([
    (0, _common.Get)('coin-packs'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "getCoinPacks", null);
_ts_decorate([
    (0, _common.Post)('stripe/create-intent'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "createStripeIntent", null);
_ts_decorate([
    (0, _common.Post)('razorpay/create-order'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "createRazorpayOrder", null);
_ts_decorate([
    (0, _common.Post)('stripe/webhook'),
    _ts_param(0, (0, _common.Headers)('stripe-signature')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "stripeWebhook", null);
_ts_decorate([
    (0, _common.Post)('razorpay/webhook'),
    _ts_param(0, (0, _common.Headers)('x-razorpay-signature')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "razorpayWebhook", null);
_ts_decorate([
    (0, _common.Post)('paypal/webhook'),
    _ts_param(0, (0, _common.Headers)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "paypalWebhook", null);
_ts_decorate([
    (0, _common.Post)('verify-paypal'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPaypal", null);
_ts_decorate([
    (0, _common.Post)('redeem'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "redeemCode", null);
_ts_decorate([
    (0, _common.Post)('admin/generate-code'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "generateCode", null);
PaymentController = _ts_decorate([
    (0, _common.Controller)('payment'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentservice.PaymentService === "undefined" ? Object : _paymentservice.PaymentService,
        typeof _redemptionservice.RedemptionService === "undefined" ? Object : _redemptionservice.RedemptionService
    ])
], PaymentController);
