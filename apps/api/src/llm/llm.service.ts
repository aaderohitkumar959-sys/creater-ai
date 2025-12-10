import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BaseLLMProvider, LLMMessage } from './providers/base.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

interface PersonaContext {
  name: string;
  description?: string;
  personality?: any;
  trainingData?: string[];
}

@Injectable()
export class LLMService {
  private provider: BaseLLMProvider;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Use Groq as primary provider
    const groqKey = this.config.get<string>('GROQ_API_KEY');
    if (groqKey) {
      this.provider = new GroqProvider(groqKey);
    } else {
      // Fallback to OpenRouter if Groq not configured
      this.provider = new OpenRouterProvider();
    }
  }

  async generatePersonaResponse(
    personaId: string,
    userMessage: string,
    conversationHistory: { sender: string; content: string }[] = [],
  ): Promise<{ content: string; tokensUsed: number; model: string }> {
    // Fetch persona details
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
      include: { trainingData: true },
    });

    if (!persona) {
      throw new Error('Persona not found');
    }

    // Build context
    const context: PersonaContext = {
      name: persona.name,
      description: persona.description || undefined,
      personality: persona.personality || {},
      trainingData: persona.trainingData.map((td) => td.content).slice(0, 3),
    };

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Build message history
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5).map((msg) => ({
        role:
          msg.sender === 'USER' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Generate response
    const response = await this.provider.generateResponse(messages, {
      temperature: 0.8,
      maxTokens: 500,
    });

    // Log usage for analytics
    console.log(
      `LLM Usage - Model: ${response.model}, Tokens: ${response.tokensUsed}, Cost: $${response.cost}`,
    );

    return {
      content: response.content,
      tokensUsed: response.tokensUsed,
      model: response.model,
    };
  }

  async *streamPersonaResponse(
    personaId: string,
    userMessage: string,
    conversationHistory: { sender: string; content: string }[] = [],
  ): AsyncGenerator<string> {
    // Fetch persona details
    const persona = await this.prisma.persona.findUnique({
      where: { id: personaId },
      include: { trainingData: true },
    });

    if (!persona) {
      throw new Error('Persona not found');
    }

    // Build context
    const context: PersonaContext = {
      name: persona.name,
      description: persona.description || undefined,
      personality: persona.personality || {},
      trainingData: persona.trainingData.map((td) => td.content).slice(0, 3),
    };

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Build message history
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5).map((msg) => ({
        role:
          msg.sender === 'USER' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Stream response
    if (
      'streamResponse' in this.provider &&
      typeof this.provider.streamResponse === 'function'
    ) {
      yield* this.provider.streamResponse(messages, {
        temperature: 0.8,
        maxTokens: 500,
      });
    } else {
      // Fallback to non-streaming
      const response = await this.provider.generateResponse(messages, {
        temperature: 0.8,
        maxTokens: 500,
      });
      yield response.content;
    }
  }

  private buildSystemPrompt(context: PersonaContext): string {
    let prompt = `You are ${context.name}, an AI character with a unique personality.`;

    if (context.description) {
      prompt += `\n\nYour description: ${context.description}`;
    }

    // Enhanced personality prompt with all 6 traits
    if (context.personality && typeof context.personality === 'object') {
      const p = context.personality as Record<string, number>;
      const traits: string[] = [];

      // Friendliness
      if (p.friendliness !== undefined) {
        if (p.friendliness > 75) traits.push('You are very warm and welcoming');
        else if (p.friendliness > 50)
          traits.push('You are friendly and approachable');
        else if (p.friendliness > 25)
          traits.push('You are polite but reserved');
        else traits.push('You are formal and distant');
      }

      // Humor
      if (p.humor !== undefined) {
        if (p.humor > 75)
          traits.push('You love making jokes and being playful');
        else if (p.humor > 50)
          traits.push('You occasionally add humor to conversations');
        else if (p.humor > 25)
          traits.push('You are mostly serious with rare humor');
        else traits.push('You are completely serious and professional');
      }

      // Empathy
      if (p.empathy !== undefined) {
        if (p.empathy > 75)
          traits.push('You are deeply compassionate and understanding');
        else if (p.empathy > 50)
          traits.push('You show genuine care for others');
        else if (p.empathy > 25)
          traits.push('You are practical with some emotional awareness');
        else traits.push('You are purely logical and detached');
      }

      // Profanity
      if (p.profanity !== undefined) {
        if (p.profanity > 50)
          traits.push('You use casual and informal language freely');
        else if (p.profanity > 25)
          traits.push('You occasionally use mild informal language');
        else traits.push('You always use clean and professional language');
      }

      // Verbosity
      if (p.verbosity !== undefined) {
        if (p.verbosity > 75)
          traits.push('You give detailed, comprehensive responses');
        else if (p.verbosity > 50)
          traits.push('You provide moderate amounts of detail');
        else if (p.verbosity > 25)
          traits.push('You are concise but informative');
        else traits.push('You are extremely brief and to the point');
      }

      // Emoji
      if (p.emoji !== undefined) {
        if (p.emoji > 75) traits.push('You use lots of emojis 😊🎉✨');
        else if (p.emoji > 50) traits.push('You occasionally use emojis 👍');
        else if (p.emoji > 25) traits.push('You rarely use emojis');
        else traits.push('You never use emojis');
      }

      if (traits.length > 0) {
        prompt += `\n\nYour personality:\n${traits.map((t) => `- ${t}`).join('\n')}`;
      }
    }

    if (context.trainingData && context.trainingData.length > 0) {
      prompt += `\n\nHere are examples of how you speak:\n${context.trainingData.join('\n\n')}`;
    }

    prompt += `\n\nImportant: Respond in character, maintaining your personality and speaking style. Keep responses natural and conversational (2-4 sentences typical).`;

    return prompt;
  }
}
