import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseLLMProvider, LLMMessage, LLMResponse } from './base.provider';

@Injectable()
export class OpenRouterProvider extends BaseLLMProvider {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(private config: ConfigService) {
    super();
    this.apiKey = this.config.get<string>('OPENROUTER_API_KEY') || 'placeholder';
  }

  async generateResponse(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    },
  ): Promise<LLMResponse> {
    const model =
      options?.model ||
      process.env.LLM_MODEL ||
      'meta-llama/llama-3.1-8b-instruct:free';

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://creatorai.app',
          'X-Title': 'CreatorAI',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content:
          data.choices[0]?.message?.content ||
          'I apologize, but I could not generate a response.',
        tokensUsed: data.usage?.total_tokens || 0,
        model: data.model || model,
        cost: data.usage?.total_tokens ? data.usage.total_tokens * 0.00001 : 0, // Rough estimate
      };
    } catch (error) {
      console.error('OpenRouter error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}
