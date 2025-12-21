import { Action, openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { PERSONAS } from '@/lib/personas';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, personaId } = await req.json();

        const persona = PERSONAS[personaId] || PERSONAS['aria']; // Default to Aria

        const result = await streamText({
            model: openai('openai/gpt-4o-mini'), // Uses OpenRouter via compatibility
            system: persona.systemPrompt,
            messages,
            temperature: 0.8,
            headers: {
                'HTTP-Referer': 'https://syelope-web.vercel.app', // Required by OpenRouter
                'X-Title': 'CreatorAI Companion',
            }
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
