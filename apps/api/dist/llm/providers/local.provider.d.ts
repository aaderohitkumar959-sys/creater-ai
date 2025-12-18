import { BaseLLMProvider, LLMMessage, LLMResponse } from './base.provider';
export declare class LocalLLMProvider extends BaseLLMProvider {
    constructor();
    generateResponse(messages: LLMMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        model?: string;
    }): Promise<LLMResponse>;
}
