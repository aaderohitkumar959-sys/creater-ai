"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LLMService", {
    enumerable: true,
    get: function() {
        return LLMService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _config = require("@nestjs/config");
const _groqprovider = require("./providers/groq.provider");
const _openrouterprovider = require("./providers/openrouter.provider");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LLMService = class LLMService {
    async generatePersonaResponse(personaId, userMessage, conversationHistory = []) {
        const persona = await this.firestore.findUnique('personas', personaId);
        if (!persona) {
            throw new Error('Persona not found');
        }
        const context = {
            name: persona.name,
            description: persona.description || undefined,
            personality: persona.personality || {},
            trainingData: persona.trainingData?.slice(0, 3) || []
        };
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory.slice(-5).map((msg)=>({
                    role: msg.sender === 'USER' ? 'user' : 'assistant',
                    content: msg.content
                })),
            {
                role: 'user',
                content: userMessage
            }
        ];
        try {
            if (this.groqProvider) {
                const response = await this.groqProvider.generateResponse(messages, {
                    temperature: 0.8,
                    maxTokens: 500
                });
                return response;
            }
        } catch (error) {
            console.error('Groq failure, falling back to OpenRouter:', error);
        }
        return this.openRouterProvider.generateResponse(messages, {
            temperature: 0.8,
            maxTokens: 500
        });
    }
    async *streamPersonaResponse(personaId, userMessage, conversationHistory = []) {
        const persona = await this.firestore.findUnique('personas', personaId);
        if (!persona) {
            throw new Error('Persona not found');
        }
        const context = {
            name: persona.name,
            description: persona.description || undefined,
            personality: persona.personality || {},
            trainingData: persona.trainingData?.slice(0, 3) || []
        };
        const systemPrompt = this.buildSystemPrompt(context);
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory.slice(-5).map((msg)=>({
                    role: msg.sender === 'USER' ? 'user' : 'assistant',
                    content: msg.content
                })),
            {
                role: 'user',
                content: userMessage
            }
        ];
        let streamSucceeded = false;
        try {
            if (this.groqProvider) {
                yield* this.groqProvider.streamResponse(messages, {
                    temperature: 0.8,
                    maxTokens: 500
                });
                streamSucceeded = true;
            }
        } catch (error) {
            console.error('Groq streaming failure, falling back to OpenRouter:', error);
        }
        if (!streamSucceeded) {
            const response = await this.openRouterProvider.generateResponse(messages, {
                temperature: 0.8,
                maxTokens: 500
            });
            yield response.content;
        }
    }
    buildSystemPrompt(context) {
        let prompt = `You are ${context.name}, an AI character with a unique personality.`;
        if (context.description) {
            prompt += `\n\nYour description: ${context.description}`;
        }
        if (context.personality && typeof context.personality === 'object') {
            const p = context.personality;
            const traits = [];
            if (p.friendliness !== undefined) {
                if (p.friendliness > 75) traits.push('You are very warm and welcoming');
                else if (p.friendliness > 50) traits.push('You are friendly and approachable');
                else if (p.friendliness > 25) traits.push('You are polite but reserved');
                else traits.push('You are formal and distant');
            }
            if (p.humor !== undefined) {
                if (p.humor > 75) traits.push('You love making jokes and being playful');
                else if (p.humor > 50) traits.push('You occasionally add humor to conversations');
                else if (p.humor > 25) traits.push('You are mostly serious with rare humor');
                else traits.push('You are completely serious and professional');
            }
            if (p.empathy !== undefined) {
                if (p.empathy > 75) traits.push('You are deeply compassionate and understanding');
                else if (p.empathy > 50) traits.push('You show genuine care for others');
                else if (p.empathy > 25) traits.push('You are practical with some emotional awareness');
                else traits.push('You are purely logical and detached');
            }
            if (p.profanity !== undefined) {
                if (p.profanity > 50) traits.push('You use casual and informal language freely');
                else if (p.profanity > 25) traits.push('You occasionally use mild informal language');
                else traits.push('You always use clean and professional language');
            }
            if (p.verbosity !== undefined) {
                if (p.verbosity > 75) traits.push('You give detailed, comprehensive responses');
                else if (p.verbosity > 50) traits.push('You provide moderate amounts of detail');
                else if (p.verbosity > 25) traits.push('You are concise but informative');
                else traits.push('You are extremely brief and to the point');
            }
            if (p.emoji !== undefined) {
                if (p.emoji > 75) traits.push('You use lots of emojis 😊🎉✨');
                else if (p.emoji > 50) traits.push('You occasionally use emojis 👍');
                else if (p.emoji > 25) traits.push('You rarely use emojis');
                else traits.push('You never use emojis');
            }
            if (traits.length > 0) {
                prompt += `\n\nYour personality:\n${traits.map((t)=>`- ${t}`).join('\n')}`;
            }
        }
        if (context.trainingData && context.trainingData.length > 0) {
            prompt += `\n\nHere are examples of how you speak:\n${context.trainingData.join('\n\n')}`;
        }
        prompt += `\n\nImportant: Respond in character, maintaining your personality and speaking style. Keep responses natural and conversational (2-4 sentences typical).`;
        return prompt;
    }
    constructor(firestore, config){
        this.firestore = firestore;
        this.config = config;
        this.groqProvider = null;
        const groqKey = this.config.get('GROQ_API_KEY');
        if (groqKey) {
            this.groqProvider = new _groqprovider.GroqProvider(groqKey);
        }
        this.openRouterProvider = new _openrouterprovider.OpenRouterProvider(this.config);
    }
};
LLMService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], LLMService);
