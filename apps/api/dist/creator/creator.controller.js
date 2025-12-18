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
exports.CreatorController = void 0;
const common_1 = require("@nestjs/common");
const creator_service_1 = require("./creator.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CreatorController = class CreatorController {
    creatorService;
    constructor(creatorService) {
        this.creatorService = creatorService;
    }
    async createProfile(req, body) {
        return this.creatorService.createCreatorProfile(req.user.userId, body.bio);
    }
    async createPersona(req, body) {
        const creator = await this.creatorService.getCreatorProfile(req.user.userId);
        if (!creator) {
            throw new Error('Creator profile not found');
        }
        return this.creatorService.createPersona(creator.id, body);
    }
    async addTrainingData(body) {
        return this.creatorService.addTrainingData(body.personaId, body.content);
    }
    async getDashboard(req) {
        return this.creatorService.getDashboardStats(req.user.userId);
    }
};
exports.CreatorController = CreatorController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "createProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('persona'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "createPersona", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('training-data'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "addTrainingData", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "getDashboard", null);
exports.CreatorController = CreatorController = __decorate([
    (0, common_1.Controller)('creator'),
    __metadata("design:paramtypes", [creator_service_1.CreatorService])
], CreatorController);
//# sourceMappingURL=creator.controller.js.map