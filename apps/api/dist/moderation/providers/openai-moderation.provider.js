"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OpenAIModerationProvider", {
    enumerable: true,
    get: function() {
        return OpenAIModerationProvider;
    }
});
let OpenAIModerationProvider = class OpenAIModerationProvider {
    async moderateContent(input) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    input
                })
            });
            if (!response.ok) {
                throw new Error(`OpenAI Moderation API error: ${response.statusText}`);
            }
            const data = await response.json();
            const result = data.results[0];
            return {
                flagged: result.flagged,
                categories: result.categories,
                category_scores: result.category_scores
            };
        } catch (error) {
            console.error('Moderation API failed:', error);
            // Fail open (allow) or closed (block) depending on policy
            // Here we fail open to avoid blocking users on API errors, but log it
            return {
                flagged: false,
                categories: {},
                category_scores: {}
            };
        }
    }
    constructor(apiKey){
        this.baseUrl = 'https://api.openai.com/v1/moderations';
        this.apiKey = apiKey;
    }
};
