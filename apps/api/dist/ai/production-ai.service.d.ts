import { ConfigService } from '@nestjs/config';
interface AIRequest {
    personaId: string;
    userMessage: string;
    conversationHistory: Array<{
        sender: string;
        content: string;
    }>;
    userId: string;
}
interface AIResponse {
    content: string;
    tokensUsed: number;
    costUSD: number;
    provider: 'openrouter' | 'openai';
    latencyMs: number;
}
export declare class ProductionAIService {
    private config;
    private readonly TIMEOUT_MS;
    private readonly MAX_RETRIES;
    private readonly COST_TARGET;
    constructor(config: ConfigService);
    generateResponse(request: AIRequest): Promise<AIResponse>;
    private generateWithRetry;
    private callProvider;
    private optimizeContext;
    private buildSystemPrompt;
    private makeAPIRequest;
    private timeout;
    private calculateCost;
    private estimateTokens;
    getUserCostStats(userId: string, days?: number): Promise<{
        totalCost: number;
        messageCount: number;
        avgCostPerMessage: number;
    }>;
}
export {};
