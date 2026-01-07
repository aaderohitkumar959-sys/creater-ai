"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AnalyticsController", {
    enumerable: true,
    get: function() {
        return AnalyticsController;
    }
});
const _common = require("@nestjs/common");
const _analyticsservice = require("./analytics.service");
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
let AnalyticsController = class AnalyticsController {
    async getOverview(userId) {
        return this.analyticsService.getCreatorOverview(userId);
    }
    async getEarnings(userId, days) {
        const daysNum = days ? parseInt(days) : 30;
        return this.analyticsService.getEarningsTimeSeries(userId, daysNum);
    }
    async getMessages(userId) {
        return this.analyticsService.getMessageStats(userId);
    }
    async getPersonas(userId) {
        return this.analyticsService.getPersonaPerformance(userId);
    }
    constructor(analyticsService){
        this.analyticsService = analyticsService;
    }
};
_ts_decorate([
    (0, _common.Get)('creator/:userId/overview'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getOverview", null);
_ts_decorate([
    (0, _common.Get)('creator/:userId/earnings'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_param(1, (0, _common.Query)('days')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getEarnings", null);
_ts_decorate([
    (0, _common.Get)('creator/:userId/messages'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMessages", null);
_ts_decorate([
    (0, _common.Get)('creator/:userId/personas'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPersonas", null);
AnalyticsController = _ts_decorate([
    (0, _common.Controller)('analytics'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _analyticsservice.AnalyticsService === "undefined" ? Object : _analyticsservice.AnalyticsService
    ])
], AnalyticsController);
