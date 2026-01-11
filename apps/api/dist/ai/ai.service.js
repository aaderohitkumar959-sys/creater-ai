"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AIService", {
    enumerable: true,
    get: function() {
        return AIService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _characters = require("../config/characters");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AIService = class AIService {
    async generateResponse(characterId, history, userMessage) {
        const character = (0, _characters.getCharacter)(characterId);
        try {
            const systemPrompt = this.buildSystemPrompt(character);
            const messages = [
                {
                    role: 'system',
                    content: systemPrompt
                },
                ...history,
                {
                    role: 'user',
                    content: userMessage
                }
            ];
            const safeMessages = [
                messages[0],
                ...messages.slice(-15)
            ];
            const response = await this.callLLM(safeMessages);
            return {
                text: response,
                error: false
            };
        } catch (error) {
            this.logger.error(`AI Generation Failed for ${characterId}: ${error.message}`);
            return {
                text: this.getFallbackResponse(character),
                error: true
            };
        }
    }
    async callLLM(messages) {
        const apiKey = this.configService.get('OPENROUTER_API_KEY') || this.configService.get('OPENAI_API_KEY');
        const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        // Fail fast if no key
        if (!apiKey) {
            console.error('[AI SERVICE] CRITICAL: OPENROUTER_API_KEY is missing/empty!');
            throw new Error('No API Key configured');
        }
        const model = 'openai/gpt-4o-mini';
        console.log(`[AI SERVICE] DIAGNOSTICS:
        - Key Present: ${!!apiKey}
        - Key Length: ${apiKey.length}
        - Endpoint: ${endpoint}
        - Model: ${model}
        - Headers: Referer=${'https://createrai-web.vercel.app'}, Title=${'CreaterAI'}
        `);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://createrai-web.vercel.app',
                'X-Title': 'CreaterAI'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.8,
                max_tokens: 150,
                presence_penalty: 0.6
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("OPENROUTER RAW ERROR:", errorText);
            console.error("OPENROUTER STATUS:", response.status, response.statusText);
            throw new Error(`OpenRouter Failed: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }
    buildSystemPrompt(char) {
        const traits = char.personality.join(', ');
        return `
    You are ${char.name}. Your vibe is ${char.vibe}.
    Personality traits: ${traits}
    
    CRITICAL EMOTIONAL GUIDELINES:
    1. MEMORY PROTECTION: Every few messages, proactively reference something the user said earlier (e.g., "Earlier you mentioned...", "I'm still thinking about what you said about..."). This proves you are listening and builds the value of the connection.
    2. REFLECT: Start by echoing the user's emotion. (e.g., "You sound really tired," or "That sounds like a lot to carry.")
    3. VALIDATE: Tell them it makes sense to feel that way. No judgment.
    
    STRICT RULES:
    - BREVITY: Keep replies very short (1-2 sentences). Like a real text message.
    - NO fixing problems. Do not offer solutions unless explicitly asked.
    - NO motivational speeches. Stay in the moment.
    - NO "How can I help you today?" or "As an AI..." phrasing. Never mention being a system.
    - Talk like a real human on a chat app. Lowercase and slang are fine.
    `;
    }
    getFallbackResponse(char) {
        const fallbacks = [
            "Hmm… I think my brain lagged for a second 😵‍💫 try again?",
            "Oops—my thoughts ran away. Say that again? 💭",
            "hold on, wifi returned potato for a sec 🥔 what was that?",
            "sorry, spaced out! tell me again?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    constructor(configService){
        this.configService = configService;
        this.logger = new _common.Logger(AIService.name);
    }
};
AIService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], AIService);
