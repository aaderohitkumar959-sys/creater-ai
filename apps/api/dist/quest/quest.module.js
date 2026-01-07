"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QuestModule", {
    enumerable: true,
    get: function() {
        return QuestModule;
    }
});
const _common = require("@nestjs/common");
const _questservice = require("./quest.service");
const _questcontroller = require("./quest.controller");
const _prismamodule = require("../prisma/prisma.module");
const _coinmodule = require("../coin/coin.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let QuestModule = class QuestModule {
};
QuestModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _coinmodule.CoinModule
        ],
        controllers: [
            _questcontroller.QuestController
        ],
        providers: [
            _questservice.QuestService
        ]
    })
], QuestModule);
