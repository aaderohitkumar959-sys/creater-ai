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
exports.MemoryController = void 0;
const common_1 = require("@nestjs/common");
const ai_memory_service_1 = require("./ai-memory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MemoryController = class MemoryController {
    memoryService;
    constructor(memoryService) {
        this.memoryService = memoryService;
    }
    async getMemories(req) {
        const userId = req.user.id;
        const memories = await this.memoryService.getUserMemories(userId);
        return {
            memories,
            count: memories.length,
        };
    }
    async getPersonaMemories(req, personaId) {
        const userId = req.user.id;
        const memories = await this.memoryService.getUserMemories(userId, personaId);
        return {
            memories,
            count: memories.length,
        };
    }
    async getMemoryStats(req) {
        const userId = req.user.id;
        return await this.memoryService.getMemoryStats(userId);
    }
    async deleteMemory(req, memoryId) {
        const userId = req.user.id;
        const deleted = await this.memoryService.deleteMemory(memoryId, userId);
        if (deleted) {
            return { message: 'Memory deleted successfully' };
        }
        else {
            throw new Error('Failed to delete memory');
        }
    }
    async deleteAllMemories(req) {
        const userId = req.user.id;
        const count = await this.memoryService.deleteAllUserMemories(userId);
        return {
            message: `Deleted ${count} memories`,
            count,
        };
    }
    async extractMemories(req, conversationId) {
        const userId = req.user.id;
        const conversation = await this.memoryService['prisma'].conversation.findUnique({
            where: { id: conversationId },
            include: { persona: true },
        });
        if (!conversation || conversation.userId !== userId) {
            throw new Error('Conversation not found');
        }
        const count = await this.memoryService.extractMemoriesFromConversation(conversationId, userId, conversation.personaId);
        return {
            message: `Extracted ${count} memories`,
            count,
        };
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemories", null);
__decorate([
    (0, common_1.Get)('persona/:personaId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('personaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getPersonaMemories", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemoryStats", null);
__decorate([
    (0, common_1.Delete)(':memoryId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('memoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteMemory", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteAllMemories", null);
__decorate([
    (0, common_1.Post)('extract/:conversationId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "extractMemories", null);
exports.MemoryController = MemoryController = __decorate([
    (0, common_1.Controller)('memory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_memory_service_1.AIMemoryService])
], MemoryController);
