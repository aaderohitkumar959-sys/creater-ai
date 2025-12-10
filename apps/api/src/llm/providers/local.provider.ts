import { Injectable } from '@nestjs/common';
import { BaseLLMProvider, LLMMessage, LLMResponse } from './base.provider';

@Injectable()
export class LocalLLMProvider extends BaseLLMProvider {
  constructor() {
    super();
  }

  async generateResponse(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    },
  ): Promise<LLMResponse> {
    // TODO: Implement local model integration (e.g., via ollama, llama.cpp)
    // For now, return a stub response
    console.warn(
      'Local LLM provider not yet implemented, returning stub response',
    );

    return {
      content:
        'This is a stub response from local model. Please configure OpenRouter or implement local model support.',
      tokensUsed: 0,
      model: 'local-stub',
      cost: 0,
    };
  }
}
