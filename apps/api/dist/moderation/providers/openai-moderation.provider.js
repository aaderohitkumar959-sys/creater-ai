"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIModerationProvider = void 0;
class OpenAIModerationProvider {
    apiKey;
    baseUrl = 'https://api.openai.com/v1/moderations';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async moderateContent(input) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({ input }),
            });
            if (!response.ok) {
                throw new Error(`OpenAI Moderation API error: ${response.statusText}`);
            }
            const data = await response.json();
            const result = data.results[0];
            return {
                flagged: result.flagged,
                categories: result.categories,
                category_scores: result.category_scores,
            };
        }
        catch (error) {
            console.error('Moderation API failed:', error);
            return {
                flagged: false,
                categories: {},
                category_scores: {},
            };
        }
    }
}
exports.OpenAIModerationProvider = OpenAIModerationProvider;
