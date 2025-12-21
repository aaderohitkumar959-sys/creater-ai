import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCharacter, CharacterConfig } from '../config/characters';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIResponse {
    text: string;
    error?: boolean;
}

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);

    constructor(private configService: ConfigService) { }

    async generateResponse(
        characterId: string,
        history: ChatMessage[],
        userMessage: string,
    ): Promise<AIResponse> {
        const character = getCharacter(characterId);

        try {
            const systemPrompt = this.buildSystemPrompt(character);
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history, // Client should send recent history
                { role: 'user', content: userMessage }
            ];

            // Safe limit for history to prevent context overflow if client sends too much
            // We keep system prompt + last 15 messages max
            const safeMessages = [
                messages[0],
                ...messages.slice(-15)
            ];

            const response = await this.callLLM(safeMessages);

            return {
                text: `[BACKEND_AI_CORE] ${response}`,
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

    private async callLLM(messages: any[]): Promise<string> {
        const apiKey = this.configService.get('OPENROUTER_API_KEY') || this.configService.get('OPENAI_API_KEY');
        const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

        // Fail fast if no key
        if (!apiKey) {
            console.error('[AI SERVICE] Missing API Key');
            throw new Error('No API Key configured');
        }

        const model = 'openai/gpt-4o-mini';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://syelope-web.vercel.app',
                'X-Title': 'Syelope AI'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.8,
                max_tokens: 150,
                presence_penalty: 0.6,
            })
        });

        if (!response.ok) {
            throw new Error(`Provider API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }

    private buildSystemPrompt(char: CharacterConfig): string {
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

    private getFallbackResponse(char: CharacterConfig): string {
        const fallbacks = [
            "Hmm… I think my brain lagged for a second 😵‍💫 try again?",
            "Oops—my thoughts ran away. Say that again? 💭",
            "hold on, wifi returned potato for a sec 🥔 what was that?",
            "sorry, spaced out! tell me again?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}
