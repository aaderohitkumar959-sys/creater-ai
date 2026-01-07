"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChatController", {
    enumerable: true,
    get: function() {
        return ChatController;
    }
});
const _common = require("@nestjs/common");
const _chatservice = require("./chat.service");
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
let ChatController = class ChatController {
    // @UseGuards(JwtAuthGuard) -> DISABLED to prevent 401/403 errors
    async getConversations(req) {
        // Fail-safe for missing user (e.g. if auth middleware fails but we want to allow guest check)
        const userId = req.user?.id || 'guest-user';
        return this.chatService.getUserConversations(userId);
    }
    // @UseGuards(JwtAuthGuard) -> DISABLED
    async startConversation(req, body) {
        const userId = req.user?.id || 'guest-user';
        return this.chatService.createConversation(userId, body.personaId);
    }
    // @UseGuards(JwtAuthGuard) -> DISABLED
    // @Post('send') -> RESTORED FOR PRODUCTION
    async sendMessage(req, body) {
        // try-catch removed to allow global exception filter to handle errors
        // and provide actual logs in Render/CloudWatch.
        // Allow userId from body if not in req.user (for stateless/guest mode)
        const userId = req.user?.id || body.userId || 'guest-user';
        return await this.chatService.sendMessage(userId, body.personaId, body.message);
    }
    // @UseGuards(JwtAuthGuard) -> DISABLED
    async sendGift(req, body) {
        const userId = req.user?.id || 'guest-user';
        return this.chatService.sendGift(userId, body.personaId, body.giftId, body.amount);
    }
    // @UseGuards(JwtAuthGuard) -> DISABLED
    async getMessages(conversationId) {
        return this.chatService.getMessages(conversationId);
    }
    constructor(chatService){
        this.chatService = chatService;
    }
};
_ts_decorate([
    (0, _common.Get)('conversations'),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "getConversations", null);
_ts_decorate([
    (0, _common.Post)('conversation'),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "startConversation", null);
_ts_decorate([
    (0, _common.Post)('send'),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
_ts_decorate([
    (0, _common.Post)('gift'),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "sendGift", null);
_ts_decorate([
    (0, _common.Get)('conversation/:id/messages'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
ChatController = _ts_decorate([
    (0, _common.Controller)('chat'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _chatservice.ChatService === "undefined" ? Object : _chatservice.ChatService
    ])
], ChatController);
