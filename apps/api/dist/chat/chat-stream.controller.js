"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ChatStreamController", {
    enumerable: true,
    get: function() {
        return ChatStreamController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _rxjs = require("rxjs");
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
let ChatStreamController = class ChatStreamController {
    streamMessage(req, personaId, message, userId) {
        console.log(`SSE Request received: personaId=${personaId}, userId=${userId}, message=${message}`);
        return new _rxjs.Observable((observer)=>{
            // Handle client disconnect
            req.on('close', ()=>{
                console.log(`Client disconnected for user ${userId}`);
            // The generator loop below will naturally stop if observer is unsubscribed,
            // but we can also explicitly complete if needed, though usually not required with Observable.
            });
            (async ()=>{
                try {
                    console.log('Starting stream generation...');
                    for await (const chunk of this.chatService.streamMessage(userId, personaId, message)){
                        if (observer.closed) {
                            console.log('Observer closed, stopping stream');
                            break;
                        }
                        console.log('Sending chunk:', chunk.type);
                        // Always send JSON-formatted SSE messages
                        observer.next({
                            data: JSON.stringify(chunk)
                        });
                    }
                    if (!observer.closed) {
                        console.log('Stream complete');
                        observer.complete();
                    }
                } catch (error) {
                    console.error('Stream error in controller:', error);
                    if (!observer.closed) {
                        // Send error as JSON instead of raw error object
                        observer.next({
                            data: JSON.stringify({
                                type: 'error',
                                message: error?.message || 'An unexpected error occurred'
                            })
                        });
                        observer.complete();
                    }
                }
            })();
        });
    }
    constructor(chatService){
        this.chatService = chatService;
    }
};
_ts_decorate([
    (0, _throttler.Throttle)({
        default: {
            limit: 10,
            ttl: 60000
        }
    }),
    (0, _common.Sse)('stream'),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)('personaId')),
    _ts_param(2, (0, _common.Query)('message')),
    _ts_param(3, (0, _common.Query)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", typeof _rxjs.Observable === "undefined" ? Object : _rxjs.Observable)
], ChatStreamController.prototype, "streamMessage", null);
ChatStreamController = _ts_decorate([
    (0, _common.Controller)('chat'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _chatservice.ChatService === "undefined" ? Object : _chatservice.ChatService
    ])
], ChatStreamController);
