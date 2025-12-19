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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const llm_service_1 = require("../llm/llm.service");
const coin_service_1 = require("../coin/coin.service");
const moderation_service_1 = require("../moderation/moderation.service");
let ChatGateway = class ChatGateway {
    chatService;
    llmService;
    coinService;
    moderationService;
    server;
    constructor(chatService, llmService, coinService, moderationService) {
        this.chatService = chatService;
        this.llmService = llmService;
        this.coinService = coinService;
        this.moderationService = moderationService;
    }
    handleConnection(client) {
        console.log(`[WS] Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`[WS] Client disconnected: ${client.id}`);
    }
    async handleMessage(data, client) {
        console.log('[CHAT] Received message:', {
            conversationId: data.conversationId,
            sender: data.sender,
            contentLength: data.content?.length || 0,
        });
        if (data.sender === 'USER' && data.userId) {
            const coinCost = 2;
            const moderationResult = await this.moderationService.moderateContent(data.content);
            if (moderationResult.blocked) {
                console.warn('[MODERATION] User message blocked:', {
                    userId: data.userId,
                    reason: moderationResult.reason,
                    severity: moderationResult.severity,
                });
                client.emit('messageBlocked', {
                    message: this.moderationService.getUserMessage(moderationResult),
                    reason: moderationResult.reason,
                });
                return;
            }
            const balance = await this.coinService.getBalance(data.userId);
            if (balance < coinCost) {
                client.emit('error', {
                    message: 'Insufficient coins. Please purchase more.',
                    balance,
                    required: coinCost,
                });
                return;
            }
            await this.chatService.saveMessage(data.conversationId, data.content, data.sender);
            this.server.to(data.conversationId).emit('newMessage', {
                ...data,
                timestamp: new Date(),
            });
            if (data.personaId) {
                try {
                    const history = await this.chatService.getMessages(data.conversationId);
                    const conversationHistory = history.slice(-5).map((msg) => ({
                        sender: msg.sender,
                        content: msg.content,
                    }));
                    console.log('[AI] Generating response for persona:', data.personaId);
                    const { content: aiResponse } = await this.llmService.generatePersonaResponse(data.personaId, data.content, conversationHistory);
                    console.log('[AI] Response generated:', {
                        personaId: data.personaId,
                        responseLength: aiResponse.length,
                    });
                    const aiModeration = await this.moderationService.moderateContent(aiResponse);
                    if (aiModeration.blocked) {
                        console.error('[MODERATION] AI response blocked:', {
                            personaId: data.personaId,
                            reason: aiModeration.reason,
                            severity: aiModeration.severity,
                        });
                        const fallbackResponse = "I need to rephrase that. Let's talk about something else! ✨";
                        await this.chatService.saveMessage(data.conversationId, fallbackResponse, 'CREATOR');
                        this.server.to(data.conversationId).emit('newMessage', {
                            conversationId: data.conversationId,
                            content: fallbackResponse,
                            sender: 'CREATOR',
                            timestamp: new Date(),
                        });
                        await this.coinService.deductCoins(data.userId, coinCost, 'Message sent to AI persona', {
                            conversationId: data.conversationId,
                            personaId: data.personaId,
                            moderationBlocked: true,
                        });
                        return;
                    }
                    await this.chatService.saveMessage(data.conversationId, aiResponse, 'CREATOR');
                    this.server.to(data.conversationId).emit('newMessage', {
                        conversationId: data.conversationId,
                        content: aiResponse,
                        sender: 'CREATOR',
                        timestamp: new Date(),
                    });
                    const deducted = await this.coinService.deductCoins(data.userId, coinCost, 'Message sent to AI persona', { conversationId: data.conversationId, personaId: data.personaId });
                    if (!deducted) {
                        console.error('[COIN] Failed to deduct coins after AI response', {
                            userId: data.userId,
                            balance,
                        });
                    }
                    console.log('[CHAT] Message flow completed successfully');
                }
                catch (error) {
                    console.error('[AI ERROR] Failed to generate AI response:', {
                        error: error.message,
                        stack: error.stack,
                        personaId: data.personaId,
                        userId: data.userId,
                    });
                    this.server.to(data.conversationId).emit('newMessage', {
                        conversationId: data.conversationId,
                        content: "I'm having trouble responding right now. Please try again in a moment! 🔄",
                        sender: 'CREATOR',
                        timestamp: new Date(),
                        isError: true,
                    });
                    client.emit('chatError', {
                        message: 'AI service unavailable',
                        canRetry: true,
                    });
                    console.log('[COIN] No coins deducted due to AI failure');
                }
            }
        }
        return { success: true };
    }
    handleJoinRoom(room, client) {
        client.join(room);
        console.log(`[WS] Client ${client.id} joined room ${room}`);
        client.emit('joinedRoom', room);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        llm_service_1.LLMService,
        coin_service_1.CoinService,
        moderation_service_1.ModerationService])
], ChatGateway);
