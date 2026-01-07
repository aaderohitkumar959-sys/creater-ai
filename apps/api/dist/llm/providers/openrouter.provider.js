"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OpenRouterProvider", {
    enumerable: true,
    get: function() {
        return OpenRouterProvider;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _baseprovider = require("./base.provider");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let OpenRouterProvider = class OpenRouterProvider extends _baseprovider.BaseLLMProvider {
    async generateResponse(messages, options) {
        const model = options?.model || process.env.LLM_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://creatorai.app',
                    'X-Title': 'CreatorAI'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: options?.temperature || 0.7,
                    max_tokens: options?.maxTokens || 500
                })
            });
            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.statusText}`);
            }
            const data = await response.json();
            return {
                content: data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.',
                tokensUsed: data.usage?.total_tokens || 0,
                model: data.model || model,
                cost: data.usage?.total_tokens ? data.usage.total_tokens * 0.00001 : 0
            };
        } catch (error) {
            console.error('OpenRouter error:', error);
            throw new Error('Failed to generate AI response');
        }
    }
    constructor(config){
        super(), this.config = config, this.baseUrl = 'https://openrouter.ai/api/v1';
        this.apiKey = this.config.get('OPENROUTER_API_KEY') || 'placeholder';
    }
};
OpenRouterProvider = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], OpenRouterProvider);
