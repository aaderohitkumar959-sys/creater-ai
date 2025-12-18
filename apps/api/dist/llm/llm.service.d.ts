import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class LLMService {
    private prisma;
    private config;
    private provider;
    constructor(prisma: PrismaService, config: ConfigService);
    generatePersonaResponse(personaId: string, userMessage: string, conversationHistory?: {
        sender: string;
        content: string;
    }[]): Promise<{
        content: string;
        tokensUsed: number;
        model: string;
    }>;
    streamPersonaResponse(personaId: string, userMessage: string, conversationHistory?: {
        sender: string;
        content: string;
    }[]): AsyncGenerator<string>;
    private buildSystemPrompt;
}
