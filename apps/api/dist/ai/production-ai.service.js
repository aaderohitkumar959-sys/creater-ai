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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionAIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ProductionAIService = class ProductionAIService {
    config;
    TIMEOUT_MS = 30000;
    MAX_RETRIES = 3;
    COST_TARGET = 0.01;
    constructor(config) {
        this.config = config;
    }
    async generateResponse(request) {
        const startTime = Date.now();
        try {
            return await this.generateWithRetry(request, 'openrouter', this.MAX_RETRIES, startTime);
        }
        catch (primaryError) {
            console.error('[AI] Primary provider failed:', {
                provider: 'openrouter',
                error: primaryError.message,
                userId: request.userId,
            });
            try {
                console.log('[AI] Attempting fallback to OpenAI');
                return await this.generateWithRetry(request, 'openai', 1, startTime);
            }
            catch (fallbackError) {
                console.error('[AI] All providers failed:', {
                    primaryError: primaryError.message,
                    fallbackError: fallbackError.message,
                    userId: request.userId,
                });
                return {
                    content: "I'm having trouble connecting right now. Please try again in a moment! 🔄",
                    tokensUsed: 0,
                    costUSD: 0,
                    provider: 'openrouter',
                    latencyMs: Date.now() - startTime,
                };
            }
        }
    }
    async generateWithRetry(request, provider, maxRetries, startTime) {
        let lastError = new Error('No attempts made');
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const elapsed = Date.now() - startTime;
                if (elapsed > this.TIMEOUT_MS) {
                    throw new Error('Request timeout exceeded');
                }
                const timeoutRemaining = this.TIMEOUT_MS - elapsed;
                const response = await this.callProvider(request, provider, timeoutRemaining);
                console.log('[AI] Request successful:', {
                    provider,
                    attempt,
                    tokensUsed: response.tokensUsed,
                    costUSD: response.costUSD,
                    latencyMs: response.latencyMs,
                });
                if (response.costUSD > this.COST_TARGET) {
                    console.warn('[AI] Cost exceeded target:', {
                        cost: response.costUSD,
                        target: this.COST_TARGET,
                    });
                }
                return response;
            }
            catch (error) {
                lastError = error;
                console.warn('[AI] Request failed:', {
                    provider,
                    attempt,
                    error: error.message,
                    retriesLeft: maxRetries - attempt,
                });
                if (attempt < maxRetries) {
                    const backoffMs = 100 * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, backoffMs));
                }
            }
        }
        throw lastError;
    }
    async callProvider(request, provider, timeoutMs) {
        const startTime = Date.now();
        const optimizedHistory = this.optimizeContext(request.conversationHistory);
        const systemPrompt = await this.buildSystemPrompt(request.personaId);
        const messages = [
            { role: 'system', content: systemPrompt },
            ...optimizedHistory.map((msg) => ({
                role: msg.sender === 'USER' ? 'user' : 'assistant',
                content: msg.content,
            })),
            { role: 'user', content: request.userMessage },
        ];
        const response = await Promise.race([
            this.makeAPIRequest(messages, provider),
            this.timeout(timeoutMs),
        ]);
        const latencyMs = Date.now() - startTime;
        const costUSD = this.calculateCost(response.tokensUsed, provider);
        return {
            content: response.content,
            tokensUsed: response.tokensUsed,
            costUSD,
            provider,
            latencyMs,
        };
    }
    optimizeContext(history) {
        const optimized = history.slice(-20);
        const totalTokens = this.estimateTokens(optimized.map((m) => m.content).join(' '));
        if (totalTokens > 2000) {
            return history.slice(-10);
        }
        return optimized;
    }
    async buildSystemPrompt(personaId) {
        return `You are a helpful AI assistant. Be concise, friendly, and engaging. Keep responses under 150 words unless asked for detail.`;
    }
    async makeAPIRequest(messages, provider) {
        const apiKey = provider === 'openrouter'
            ? this.config.get('OPENROUTER_API_KEY')
            : this.config.get('OPENAI_API_KEY');
        const endpoint = provider === 'openrouter'
            ? 'https://openrouter.ai/api/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';
        const model = provider === 'openrouter'
            ? 'meta-llama/llama-3.1-8b-instruct:free'
            : 'gpt-3.5-turbo';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                ...(provider === 'openrouter' && {
                    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                }),
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 300,
                temperature: 0.7,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`${provider} API error: ${error}`);
        }
        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage?.total_tokens || 0,
        };
    }
    async timeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), ms);
        });
    }
    calculateCost(tokens, provider) {
        if (provider === 'openrouter') {
            return 0;
        }
        const avgCostPer1MTokens = 1.0;
        return (tokens / 1000000) * avgCostPer1MTokens;
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    async getUserCostStats(userId, days = 30) {
        return {
            totalCost: 0,
            messageCount: 0,
            avgCostPerMessage: 0,
        };
    }
};
exports.ProductionAIService = ProductionAIService;
exports.ProductionAIService = ProductionAIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProductionAIService);
