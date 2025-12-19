"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptOptimizationService = void 0;
const common_1 = require("@nestjs/common");
let PromptOptimizationService = class PromptOptimizationService {
    compressPersonaPrompt(personaName, description, personality) {
        const prompt = `You are ${personaName}. ${this.shortenDescription(description)}

Personality: ${this.formatPersonality(personality)}

Rules:
- Keep responses <150 words
- Be ${personality?.tone || 'friendly'} and engaging
- Stay in character
- Don't mention you're an AI`;
        return prompt;
    }
    shortenDescription(description) {
        if (!description)
            return '';
        if (description.length <= 100) {
            return description;
        }
        const shortened = description.substring(0, 100);
        const lastPeriod = shortened.lastIndexOf('.');
        if (lastPeriod > 50) {
            return shortened.substring(0, lastPeriod + 1);
        }
        return shortened + '...';
    }
    formatPersonality(personality) {
        if (!personality)
            return 'friendly, helpful';
        const traits = [];
        if (personality.tone)
            traits.push(personality.tone);
        if (personality.humor)
            traits.push('humorous');
        if (personality.empathy > 7)
            traits.push('empathetic');
        if (personality.creativity > 7)
            traits.push('creative');
        return traits.join(', ') || 'friendly';
    }
    compressConversationHistory(messages) {
        let compressed = messages.slice(-20);
        const totalLength = compressed.reduce((sum, m) => sum + m.content.length, 0);
        if (totalLength > 8000) {
            compressed = compressed.slice(-10);
        }
        return compressed;
    }
    extractKeyPoints(message) {
        if (message.length <= 200) {
            return message;
        }
        return message.substring(0, 200) + '...';
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    validateTokenBudget(systemPrompt, conversationHistory, userMessage, maxTokens = 2000) {
        const totalText = systemPrompt + conversationHistory + userMessage;
        const estimated = this.estimateTokens(totalText);
        return {
            valid: estimated <= maxTokens,
            estimated,
            max: maxTokens,
        };
    }
    buildOptimizedPrompt(personaName, description, personality, memories = []) {
        const basePrompt = this.compressPersonaPrompt(personaName, description, personality);
        if (memories.length === 0) {
            return basePrompt;
        }
        const memoryContext = memories.slice(0, 5).join('; ');
        return `${basePrompt}\n\nContext: ${memoryContext}`;
    }
};
exports.PromptOptimizationService = PromptOptimizationService;
exports.PromptOptimizationService = PromptOptimizationService = __decorate([
    (0, common_1.Injectable)()
], PromptOptimizationService);
