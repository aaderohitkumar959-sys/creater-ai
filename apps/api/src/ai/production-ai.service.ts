import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AIRequest {
    personaId: string;
    userMessage: string;
    conversationHistory: Array<{ sender: string; content: string }>;
    userId: string;
}

interface AIResponse {
    content: string;
    tokensUsed: number;
    costUSD: number;
    provider: 'openrouter' | 'openai';
    latencyMs: number;
}

@Injectable()
export class ProductionAIService {
    private readonly TIMEOUT_MS = 30000; // 30 seconds
    private readonly MAX_RETRIES = 3;
    private readonly COST_TARGET = 0.01; // $0.01 per message

    constructor(private config: ConfigService) { }

    /**
     * Generate AI response with timeout, retry, and fallback
     * Production-grade implementation
     */
    async generateResponse(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();

        // Try primary provider (OpenRouter)
        try {
            return await this.generateWithRetry(
                request,
                'openrouter',
                this.MAX_RETRIES,
                startTime,
            );
        } catch (primaryError) {
            console.error('[AI] Primary provider failed:', {
                provider: 'openrouter',
                error: primaryError.message,
                userId: request.userId,
            });

            // Fallback to OpenAI
            try {
                console.log('[AI] Attempting fallback to OpenAI');
                return await this.generateWithRetry(
                    request,
                    'openai',
                    1, // Only 1 retry for fallback
                    startTime,
                );
            } catch (fallbackError) {
                console.error('[AI] All providers failed:', {
                    primaryError: primaryError.message,
                    fallbackError: fallbackError.message,
                    userId: request.userId,
                });

                // Return safe fallback message
                return {
                    content:
                        "I'm having trouble connecting right now. Please try again in a moment! 🔄",
                    tokensUsed: 0,
                    costUSD: 0,
                    provider: 'openrouter',
                    latencyMs: Date.now() - startTime,
                };
            }
        }
    }

    /**
     * Generate with retry logic and exponential backoff
     */
    private async generateWithRetry(
        request: AIRequest,
        provider: 'openrouter' | 'openai',
        maxRetries: number,
        startTime: number,
    ): Promise<AIResponse> {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Check if we've exceeded timeout
                const elapsed = Date.now() - startTime;
                if (elapsed > this.TIMEOUT_MS) {
                    throw new Error('Request timeout exceeded');
                }

                const timeoutRemaining = this.TIMEOUT_MS - elapsed;

                // Generate with provider
                const response = await this.callProvider(
                    request,
                    provider,
                    timeoutRemaining,
                );

                // Log successful request
                console.log('[AI] Request successful:', {
                    provider,
                    attempt,
                    tokensUsed: response.tokensUsed,
                    costUSD: response.costUSD,
                    latencyMs: response.latencyMs,
                });

                // Check cost threshold
                if (response.costUSD > this.COST_TARGET) {
                    console.warn('[AI] Cost exceeded target:', {
                        cost: response.costUSD,
                        target: this.COST_TARGET,
                    });
                }

                return response;
            } catch (error) {
                lastError = error;

                console.warn('[AI] Request failed:', {
                    provider,
                    attempt,
                    error: error.message,
                    retriesLeft: maxRetries - attempt,
                });

                // Exponential backoff: wait 100ms * 2^attempt
                if (attempt < maxRetries) {
                    const backoffMs = 100 * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, backoffMs));
                }
            }
        }

        throw lastError;
    }

    /**
     * Call AI provider with timeout
     */
    private async callProvider(
        request: AIRequest,
        provider: 'openrouter' | 'openai',
        timeoutMs: number,
    ): Promise<AIResponse> {
        const startTime = Date.now();

        // Optimize context (last 20 messages only)
        const optimizedHistory = this.optimizeContext(
            request.conversationHistory,
        );

        // Build system prompt (compressed)
        const systemPrompt = await this.buildSystemPrompt(request.personaId);

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...optimizedHistory.map((msg) => ({
                role: msg.sender === 'USER' ? 'user' : 'assistant',
                content: msg.content,
            })),
            { role: 'user', content: request.userMessage },
        ];

        // Call provider with timeout
        const response = await Promise.race([
            this.makeAPIRequest(messages, provider),
            this.timeout(timeoutMs),
        ]);

        const latencyMs = Date.now() - startTime;

        // Calculate cost
        const costUSD = this.calculateCost(
            response.tokensUsed,
            provider,
        );

        return {
            content: response.content,
            tokensUsed: response.tokensUsed,
            costUSD,
            provider,
            latencyMs,
        };
    }

    /**
     * Optimize conversation context (keep last 20 messages)
     */
    private optimizeContext(
        history: Array<{ sender: string; content: string }>,
    ): Array<{ sender: string; content: string }> {
        // Keep last 20 messages for context
        const optimized = history.slice(-20);

        // Further compress if needed
        const totalTokens = this.estimateTokens(
            optimized.map((m) => m.content).join(' '),
        );

        if (totalTokens > 2000) {
            // Too long, reduce to last 10 messages
            return history.slice(-10);
        }

        return optimized;
    }

    /**
     * Build compressed system prompt
     */
    private async buildSystemPrompt(personaId: string): Promise<string> {
        // TODO: Fetch persona from database
        // For now, return generic prompt

        return `You are a helpful AI assistant. Be concise, friendly, and engaging. Keep responses under 150 words unless asked for detail.`;
    }

    /**
     * Make actual API request to provider
     */
    private async makeAPIRequest(
        messages: any[],
        provider: 'openrouter' | 'openai',
    ): Promise<{ content: string; tokensUsed: number }> {
        const apiKey =
            provider === 'openrouter'
                ? this.config.get('OPENROUTER_API_KEY')
                : this.config.get('OPENAI_API_KEY');

        const endpoint =
            provider === 'openrouter'
                ? 'https://openrouter.ai/api/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions';

        const model =
            provider === 'openrouter'
                ? 'meta-llama/llama-3.1-8b-instruct:free'
                : 'gpt-3.5-turbo';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                ...(provider === 'openrouter' && {
                    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                }),
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 300, // Cost control
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`${provider} API error: ${error}`);
        }

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage?.total_tokens || 0,
        };
    }

    /**
     * Timeout helper
     */
    private async timeout(ms: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), ms);
        });
    }

    /**
     * Calculate cost based on tokens and provider
     */
    private calculateCost(tokens: number, provider: 'openrouter' | 'openai'): number {
        // OpenRouter (Llama 3.1 8B): Free
        if (provider === 'openrouter') {
            return 0;
        }

        // OpenAI GPT-3.5-turbo: $0.50 / 1M input, $1.50 / 1M output
        // Estimate 50/50 split
        const avgCostPer1MTokens = 1.0;
        return (tokens / 1000000) * avgCostPer1MTokens;
    }

    /**
     * Estimate tokens (rough approximation)
     */
    private estimateTokens(text: string): number {
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    /**
     * Get cost statistics for a user
     */
    async getUserCostStats(userId: string, days: number = 30): Promise<{
        totalCost: number;
        messageCount: number;
        avgCostPerMessage: number;
    }> {
        // TODO: Implement cost tracking in database
        return {
            totalCost: 0,
            messageCount: 0,
            avgCostPerMessage: 0,
        };
    }
}
