"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChatService", {
    enumerable: true,
    get: function() {
        return ChatService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _aiservice = require("../ai/ai.service");
const _moderationservice = require("../moderation/moderation.service");
const _analyticsservice = require("../analytics/analytics.service");
const _meterservice = require("../meter/meter.service");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ChatService = class ChatService {
    async saveMessage(conversationId, content, sender) {
        const messageData = {
            conversationId,
            content,
            sender,
            createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await this.firestore.collection('conversations').doc(conversationId).collection('messages').add(messageData);
        return {
            id: docRef.id,
            ...messageData
        };
    }
    async getMessages(conversationId) {
        const snapshot = await this.firestore.collection('conversations').doc(conversationId).collection('messages').orderBy('createdAt', 'asc').get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...doc.data()
            }));
    }
    async getUserConversations(userId) {
        const snapshot = await this.firestore.collection('conversations').where('userId', '==', userId).orderBy('updatedAt', 'desc').get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...doc.data()
            }));
    }
    async createConversation(userId, personaId) {
        const convId = `${userId}_${personaId}`;
        const convRef = this.firestore.collection('conversations').doc(convId);
        const doc = await convRef.get();
        if (!doc.exists) {
            await convRef.set({
                userId,
                personaId,
                createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp(),
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await convRef.update({
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        }
        const persona = await this.firestore.findUnique('personas', personaId);
        const messages = await this.getMessages(convId);
        return {
            id: convId,
            userId,
            personaId,
            persona,
            messages: messages.slice(-15)
        };
    }
    async sendMessage(userId, personaId, message) {
        // 0. Metering Check
        const { allowed, remaining } = await this.meteredService.checkLimit(userId);
        if (!allowed) {
            throw new _common.ForbiddenException('You ran out of messages! 🕒 Come back tomorrow!');
        }
        // 1. Moderate Input
        const moderationResult = await this.moderation.checkContent(message);
        if (moderationResult.blocked) {
            await this.moderation.logViolation(userId, moderationResult.reason || 'CONTENT_VIOLATION', message);
            return {
                userMessage: {
                    content: message,
                    createdAt: new Date()
                },
                aiMessage: {
                    content: "I can't talk about that 🙅‍♀️",
                    createdAt: new Date()
                },
                remainingMessages: remaining
            };
        }
        // 2. Setup Conversation
        const conversation = await this.createConversation(userId, personaId);
        // 3. Save User Message
        const userMessage = await this.saveMessage(conversation.id, message, 'USER');
        await this.meteredService.incrementUsage(userId);
        // 4. Prepare History for AI
        const history = conversation.messages.map((m)=>({
                role: m.sender === 'USER' ? 'user' : 'assistant',
                content: m.content
            }));
        // 5. Generate AI Response
        const aiResponse = await this.aiService.generateResponse(personaId, history, message);
        // 6. Save AI Response
        const aiMessage = await this.saveMessage(conversation.id, aiResponse.text, 'CREATOR');
        return {
            userMessage,
            aiMessage,
            tokensUsed: 0,
            model: 'llama-3.1',
            remainingMessages: remaining > 0 ? remaining - 1 : -1
        };
    }
    async *streamMessage(userId, personaId, message) {
        try {
            const result = await this.sendMessage(userId, personaId, message);
            yield {
                type: 'chunk',
                content: result.aiMessage.content
            };
            yield {
                type: 'complete',
                messageId: result.aiMessage.id,
                remainingMessages: result.remainingMessages
            };
        } catch (error) {
            yield {
                type: 'error',
                content: "My brain is buffering... try again? 🔄"
            };
        }
    }
    async sendGift(userId, personaId, giftId, amount) {
        await this.firestore.update('users', userId, {
            coinBalance: _firebaseadmin.firestore.FieldValue.increment(-amount)
        });
        const conversation = await this.createConversation(userId, personaId);
        return this.saveMessage(conversation.id, `🎁 Sent a gift! (${amount} coins)`, 'USER');
    }
    constructor(firestore, aiService, moderation, analytics, meteredService){
        this.firestore = firestore;
        this.aiService = aiService;
        this.moderation = moderation;
        this.analytics = analytics;
        this.meteredService = meteredService;
    }
};
ChatService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _aiservice.AIService === "undefined" ? Object : _aiservice.AIService,
        typeof _moderationservice.ModerationService === "undefined" ? Object : _moderationservice.ModerationService,
        typeof _analyticsservice.AnalyticsService === "undefined" ? Object : _analyticsservice.AnalyticsService,
        typeof _meterservice.MeteredService === "undefined" ? Object : _meterservice.MeteredService
    ])
], ChatService);
