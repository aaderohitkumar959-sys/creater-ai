import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { PERSONAS } from '@/lib/personas';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || 'sk-or-v1-placeholder',
    baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req: Request) {
    try {
        const { messages, personaId } = await req.json();

        const persona = PERSONAS[personaId] || PERSONAS['aria']; // Default to Aria
        const systemMessage = { role: 'system', content: persona.systemPrompt };

        // Standard OpenAI call (v3 SDK stye)
        // @ts-ignore - OpenAI SDK types are strict about headers location for OpenRouter
        const response = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            stream: true,
            messages: [systemMessage, ...messages],
            temperature: 0.8,
        }, {
            headers: {
                'HTTP-Referer': 'https://syelope-web.vercel.app',
                'X-Title': 'CreatorAI Companion',
            },
        });

        // v3 Streaming
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
