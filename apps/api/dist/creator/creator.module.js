"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorModule = void 0;
const common_1 = require("@nestjs/common");
const creator_service_1 = require("./creator.service");
const creator_controller_1 = require("./creator.controller");
const social_fetcher_service_1 = require("./social-fetcher.service");
const social_fetcher_controller_1 = require("./social-fetcher.controller");
let CreatorModule = class CreatorModule {
};
exports.CreatorModule = CreatorModule;
exports.CreatorModule = CreatorModule = __decorate([
    (0, common_1.Module)({
        providers: [creator_service_1.CreatorService, social_fetcher_service_1.SocialFetcherService],
        controllers: [creator_controller_1.CreatorController, social_fetcher_controller_1.SocialFetcherController],
        exports: [creator_service_1.CreatorService],
    })
], CreatorModule);
//# sourceMappingURL=creator.module.js.map