"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoinController", {
    enumerable: true,
    get: function() {
        return CoinController;
    }
});
const _common = require("@nestjs/common");
const _coinservice = require("./coin.service");
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
let CoinController = class CoinController {
    async getBalance(userId) {
        const balance = await this.coinService.getBalance(userId);
        return {
            balance
        };
    }
    async getTransactions(userId) {
        return this.coinService.getTransactionHistory(userId);
    }
    async spendCoins(body) {
        return this.coinService.deductCoins(body.userId, body.amount, body.description);
    }
    constructor(coinService){
        this.coinService = coinService;
    }
};
_ts_decorate([
    (0, _common.Get)('balance/:userId'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CoinController.prototype, "getBalance", null);
_ts_decorate([
    (0, _common.Get)('transactions/:userId'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CoinController.prototype, "getTransactions", null);
_ts_decorate([
    (0, _common.Post)('spend'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CoinController.prototype, "spendCoins", null);
CoinController = _ts_decorate([
    (0, _common.Controller)('coin'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _coinservice.CoinService === "undefined" ? Object : _coinservice.CoinService
    ])
], CoinController);
