"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FailsafeFilter", {
    enumerable: true,
    get: function() {
        return FailsafeFilter;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let FailsafeFilter = class FailsafeFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        // 1. LOG THE REAL ERROR (Critical for debugging)
        const status = exception instanceof _common.HttpException ? exception.getStatus() : _common.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = exception instanceof _common.HttpException ? exception.getResponse() : exception;
        this.logger.error(`[CRITICAL FAILSAFE CAUGHT ERROR] Path: ${request.url}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        // 2. CHECK IF IT'S A CHAT ROUTE
        // We only want to mask errors for the end-user on chat routes to prevent "Red screen of death"
        if (request.url.includes('/chat/send') || request.url.includes('/public-chat')) {
            // 3. RETURN FRIENDLY FAILSAFE RESPONSE
            // This matches the structure expected by ChatUI.tsx
            return response.status(200).json({
                userMessage: {
                    id: Date.now().toString(),
                    content: request.body.message || "...",
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
                remainingMessages: 5,
                debugError: process.env.NODE_ENV === 'development' ? JSON.stringify(errorResponse) : undefined
            });
        }
        // For non-chat routes, return normal error behavior (or global error page equivalent)
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Internal Server Error (Check logs)'
        });
    }
    constructor(){
        this.logger = new _common.Logger(FailsafeFilter.name);
    }
};
FailsafeFilter = _ts_decorate([
    (0, _common.Catch)()
], FailsafeFilter);
