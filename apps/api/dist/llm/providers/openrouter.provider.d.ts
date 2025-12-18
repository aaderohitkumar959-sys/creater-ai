import { BaseLLMProvider, LLMMessage, LLMResponse } from './base.provider';
export declare class OpenRouterProvider extends BaseLLMProvider {
    private apiKey;
    private baseUrl;
    constructor();
    generateResponse(messages: LLMMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        model?: string;
    }): Promise<LLMResponse>;
}
