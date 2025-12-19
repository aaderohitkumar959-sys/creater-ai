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
exports.ChatStreamController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const rxjs_1 = require("rxjs");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChatStreamController = class ChatStreamController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async sendMessage(req, body) {
        const userId = req.user.id;
        const result = await this.chatService.sendMessage(userId, body.personaId, body.message);
        return {
            message: result.aiMessage,
            tokensUsed: result.tokensUsed,
            model: result.model,
        };
    }
    streamMessage(req, personaId, message, userId) {
        console.log(`SSE Request received: personaId=${personaId}, userId=${userId}, message=${message}`);
        return new rxjs_1.Observable((observer) => {
            req.on('close', () => {
                console.log(`Client disconnected for user ${userId}`);
            });
            (async () => {
                try {
                    console.log('Starting stream generation...');
                    for await (const chunk of this.chatService.streamMessage(userId, personaId, message)) {
                        if (observer.closed) {
                            console.log('Observer closed, stopping stream');
                            break;
                        }
                        console.log('Sending chunk:', chunk.type);
                        observer.next({
                            data: JSON.stringify(chunk),
                        });
                    }
                    if (!observer.closed) {
                        console.log('Stream complete');
                        observer.complete();
                    }
                }
                catch (error) {
                    console.error('Stream error in controller:', error);
                    if (!observer.closed) {
                        observer.next({
                            data: JSON.stringify({
                                type: 'error',
                                message: error?.message || 'An unexpected error occurred',
                            }),
                        });
                        observer.complete();
                    }
                }
            })();
        });
    }
};
exports.ChatStreamController = ChatStreamController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatStreamController.prototype, "sendMessage", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.Sse)('stream'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('personaId')),
    __param(2, (0, common_1.Query)('message')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", rxjs_1.Observable)
], ChatStreamController.prototype, "streamMessage", null);
exports.ChatStreamController = ChatStreamController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatStreamController);
