export declare class PromptOptimizationService {
    compressPersonaPrompt(personaName: string, description: string, personality: any): string;
    private shortenDescription;
    private formatPersonality;
    compressConversationHistory(messages: Array<{
        sender: string;
        content: string;
    }>): Array<{
        sender: string;
        content: string;
    }>;
    extractKeyPoints(message: string): string;
    estimateTokens(text: string): number;
    validateTokenBudget(systemPrompt: string, conversationHistory: string, userMessage: string, maxTokens?: number): {
        valid: boolean;
        estimated: number;
        max: number;
    };
    buildOptimizedPrompt(personaName: string, description: string, personality: any, memories?: string[]): string;
}
