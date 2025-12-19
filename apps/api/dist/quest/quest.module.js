"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestModule = void 0;
const common_1 = require("@nestjs/common");
const quest_service_1 = require("./quest.service");
const quest_controller_1 = require("./quest.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const coin_module_1 = require("../coin/coin.module");
let QuestModule = class QuestModule {
};
exports.QuestModule = QuestModule;
exports.QuestModule = QuestModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, coin_module_1.CoinModule],
        controllers: [quest_controller_1.QuestController],
        providers: [quest_service_1.QuestService],
    })
], QuestModule);
