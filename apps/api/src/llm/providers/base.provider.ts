export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
  cost?: number;
  provider?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export abstract class BaseLLMProvider {
  abstract generateResponse(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    },
  ): Promise<LLMResponse>;

  // Optional streaming support
  streamResponse?(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    },
  ): AsyncGenerator<string>;
}
