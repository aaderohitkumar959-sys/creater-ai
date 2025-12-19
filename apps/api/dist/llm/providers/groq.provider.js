"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const base_provider_1 = require("./base.provider");
class GroqProvider extends base_provider_1.BaseLLMProvider {
    apiKey;
    baseUrl = 'https://api.groq.com/openai/v1';
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
    }
    async generateResponse(messages, options) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 500,
                stream: false,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
        }
        const data = await response.json();
        const choice = data.choices[0];
        return {
            content: choice.message.content,
            model: data.model,
            tokensUsed: data.usage.total_tokens,
            cost: 0,
            provider: 'groq',
        };
    }
    async *streamResponse(messages, options) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 500,
                stream: true,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]')
                            continue;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.GroqProvider = GroqProvider;
