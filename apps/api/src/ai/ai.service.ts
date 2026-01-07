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
                ...history,
                { role: 'user', content: userMessage }
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

    private async callLLM(messages: any[]): Promise<string> {
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
                presence_penalty: 0.6,
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

    private buildSystemPrompt(char: CharacterConfig): string {
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
