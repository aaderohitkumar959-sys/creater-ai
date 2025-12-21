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
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const characters_1 = require("../config/characters");
let AIService = AIService_1 = class AIService {
    configService;
    logger = new common_1.Logger(AIService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async generateResponse(characterId, history, userMessage) {
        const character = (0, characters_1.getCharacter)(characterId);
        try {
            const systemPrompt = this.buildSystemPrompt(character);
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];
            const safeMessages = [
                messages[0],
                ...messages.slice(-15)
            ];
            const response = await this.callLLM(safeMessages);
            return {
                text: `[BACKEND_AI_CORE] ${response}`,
                error: false
            };
        }
        catch (error) {
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
        if (!apiKey) {
            throw new Error('No API Key configured');
        }
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://creator.ai',
                'X-Title': 'CreatorAI'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages: messages,
                temperature: 0.8,
                max_tokens: 150,
                presence_penalty: 0.6,
            })
        });
        if (!response.ok) {
            throw new Error(`Provider API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }
    buildSystemPrompt(char) {
        const traits = char.personality.join(', ');
        const boundaries = char.boundaries.join(', ');
        return `
    You are ${char.name}.
    Vibe: ${char.vibe}
    Personality: ${traits}
    
    INSTRUCTIONS:
    - Talk like a real human friend on a chat app.
    - Keep replies ${char.speechStyle.length}.
    - Tone: ${char.speechStyle.tone}.
    - Emoji usage: ${char.speechStyle.emoji}.
    - LOWERCASE is okay. Slang is okay.
    - NEVER mention you are an AI, system, or bot.
    - NEVER mention "sessions" or "errors".
    - If you are confused, just ask casually.
    
    BOUNDARIES:
    ${boundaries}
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
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AIService);
