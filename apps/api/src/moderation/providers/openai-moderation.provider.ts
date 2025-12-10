export class OpenAIModerationProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/moderations';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async moderateContent(input: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }> {
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
    } catch (error) {
      console.error('Moderation API failed:', error);
      // Fail open (allow) or closed (block) depending on policy
      // Here we fail open to avoid blocking users on API errors, but log it
      return {
        flagged: false,
        categories: {},
        category_scores: {},
      };
    }
  }
}
