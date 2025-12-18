import { BaseLLMProvider, LLMMessage, LLMResponse } from './base.provider';
export declare class GroqProvider extends BaseLLMProvider {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    generateResponse(messages: LLMMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        stream?: boolean;
    }): Promise<LLMResponse>;
    streamResponse(messages: LLMMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
    }): AsyncGenerator<string>;
}
