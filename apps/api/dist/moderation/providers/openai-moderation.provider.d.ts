export declare class OpenAIModerationProvider {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    moderateContent(input: string): Promise<{
        flagged: boolean;
        categories: Record<string, boolean>;
        category_scores: Record<string, number>;
    }>;
}
