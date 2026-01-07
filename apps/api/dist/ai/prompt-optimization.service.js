"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PromptOptimizationService", {
    enumerable: true,
    get: function() {
        return PromptOptimizationService;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PromptOptimizationService = class PromptOptimizationService {
    /**
     * Compress persona system prompt to reduce token usage
     * Target: <200 tokens per system prompt
     */ compressPersonaPrompt(personaName, description, personality) {
        // Use concise formatting
        const prompt = `You are ${personaName}. ${this.shortenDescription(description)}

Personality: ${this.formatPersonality(personality)}

Rules:
- Keep responses <150 words
- Be ${personality?.tone || 'friendly'} and engaging
- Stay in character
- Don't mention you're an AI`;
        return prompt;
    }
    /**
     * Shorten description to key points only
     */ shortenDescription(description) {
        if (!description) return '';
        // Take first 100 characters
        if (description.length <= 100) {
            return description;
        }
        // Find last complete sentence within 100 chars
        const shortened = description.substring(0, 100);
        const lastPeriod = shortened.lastIndexOf('.');
        if (lastPeriod > 50) {
            return shortened.substring(0, lastPeriod + 1);
        }
        return shortened + '...';
    }
    /**
     * Format personality traits concisely
     */ formatPersonality(personality) {
        if (!personality) return 'friendly, helpful';
        const traits = []; // Explicitly type as string array
        // Extract key traits
        if (personality.tone) traits.push(personality.tone);
        if (personality.humor) traits.push('humorous');
        if (personality.empathy > 7) traits.push('empathetic');
        if (personality.creativity > 7) traits.push('creative');
        return traits.join(', ') || 'friendly';
    }
    /**
     * Compress conversation history by removing redundant content
     */ compressConversationHistory(messages) {
        // Keep last 20 messages
        let compressed = messages.slice(-20);
        // Further compress if too long (>2000 tokens estimated)
        const totalLength = compressed.reduce((sum, m)=>sum + m.content.length, 0);
        if (totalLength > 8000) {
            // ~2000 tokens
            // Keep only last 10 messages
            compressed = compressed.slice(-10);
        }
        return compressed;
    }
    /**
     * Extract key points from long user message
     */ extractKeyPoints(message) {
        if (message.length <= 200) {
            return message;
        }
        // Take first 200 characters
        // In production, could use AI summarization here
        return message.substring(0, 200) + '...';
    }
    /**
     * Calculate estimated token count
     */ estimateTokens(text) {
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }
    /**
     * Validate prompt is within budget
     */ validateTokenBudget(systemPrompt, conversationHistory, userMessage, maxTokens = 2000) {
        const totalText = systemPrompt + conversationHistory + userMessage;
        const estimated = this.estimateTokens(totalText);
        return {
            valid: estimated <= maxTokens,
            estimated,
            max: maxTokens
        };
    }
    /**
     * Build optimized system prompt with memory context
     */ buildOptimizedPrompt(personaName, description, personality, memories = []) {
        const basePrompt = this.compressPersonaPrompt(personaName, description, personality);
        if (memories.length === 0) {
            return basePrompt;
        }
        // Add condensed memories
        const memoryContext = memories.slice(0, 5).join('; ');
        return `${basePrompt}\n\nContext: ${memoryContext}`;
    }
};
PromptOptimizationService = _ts_decorate([
    (0, _common.Injectable)()
], PromptOptimizationService);
