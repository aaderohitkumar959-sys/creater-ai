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
exports.OpenRouterProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const base_provider_1 = require("./base.provider");
let OpenRouterProvider = class OpenRouterProvider extends base_provider_1.BaseLLMProvider {
    config;
    apiKey;
    baseUrl = 'https://openrouter.ai/api/v1';
    constructor(config) {
        super();
        this.config = config;
        this.apiKey = this.config.get('OPENROUTER_API_KEY') || 'placeholder';
    }
    async generateResponse(messages, options) {
        const model = options?.model ||
            process.env.LLM_MODEL ||
            'meta-llama/llama-3.1-8b-instruct:free';
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://creatorai.app',
                    'X-Title': 'CreatorAI',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: options?.temperature || 0.7,
                    max_tokens: options?.maxTokens || 500,
                }),
            });
            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.statusText}`);
            }
            const data = await response.json();
            return {
                content: data.choices[0]?.message?.content ||
                    'I apologize, but I could not generate a response.',
                tokensUsed: data.usage?.total_tokens || 0,
                model: data.model || model,
                cost: data.usage?.total_tokens ? data.usage.total_tokens * 0.00001 : 0,
            };
        }
        catch (error) {
            console.error('OpenRouter error:', error);
            throw new Error('Failed to generate AI response');
        }
    }
};
exports.OpenRouterProvider = OpenRouterProvider;
exports.OpenRouterProvider = OpenRouterProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenRouterProvider);
