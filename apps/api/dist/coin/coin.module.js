"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoinModule", {
    enumerable: true,
    get: function() {
        return CoinModule;
    }
});
const _common = require("@nestjs/common");
const _coinservice = require("./coin.service");
const _coincontroller = require("./coin.controller");
const _adrewardcontroller = require("./ad-reward.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CoinModule = class CoinModule {
};
CoinModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        providers: [
            _coinservice.CoinService
        ],
        controllers: [
            _coincontroller.CoinController,
            _adrewardcontroller.AdRewardController
        ],
        exports: [
            _coinservice.CoinService
        ]
    })
], CoinModule);
