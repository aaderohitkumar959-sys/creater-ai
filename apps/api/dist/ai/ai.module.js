"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const production_ai_service_1 = require("./production-ai.service");
const ai_memory_service_1 = require("./ai-memory.service");
const memory_controller_1 = require("./memory.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [memory_controller_1.MemoryController],
        providers: [production_ai_service_1.ProductionAIService, ai_memory_service_1.AIMemoryService],
        exports: [production_ai_service_1.ProductionAIService, ai_memory_service_1.AIMemoryService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map