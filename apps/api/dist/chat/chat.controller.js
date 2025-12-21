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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getConversations(req) {
        const userId = req.user?.id || 'guest-user';
        return this.chatService.getUserConversations(userId);
    }
    async startConversation(req, body) {
        const userId = req.user?.id || 'guest-user';
        return this.chatService.createConversation(userId, body.personaId);
    }
    async sendMessage(req, body) {
        try {
            const userId = req.user?.id || body.userId || 'guest-user';
            return await this.chatService.sendMessage(userId, body.personaId, body.message);
        }
        catch (error) {
            console.error('[CHAT_CONTROLLER_FAILSAFE]', error);
            return {
                userMessage: {
                    id: Date.now().toString(),
                    content: body.message,
                    createdAt: new Date(),
                    sender: 'USER'
                },
                aiMessage: {
                    id: (Date.now() + 1).toString(),
                    content: "[BACKEND_FAILSAFE] Hmm, my connections are fuzzy right now 🌫️ let's try that again?",
                    createdAt: new Date(),
                    sender: 'CREATOR'
                },
                tokensUsed: 0,
                model: 'failsafe',
                remainingMessages: 5
            };
        }
    }
    async sendGift(req, body) {
        const userId = req.user?.id || 'guest-user';
        return this.chatService.sendGift(userId, body.personaId, body.giftId, body.amount);
    }
    async getMessages(conversationId) {
        return this.chatService.getMessages(conversationId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)('conversation'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "startConversation", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('gift'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendGift", null);
__decorate([
    (0, common_1.Get)('conversation/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
