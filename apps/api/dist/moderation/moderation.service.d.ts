import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
interface ModerationResult {
    blocked: boolean;
    reason?: string;
    categories?: string[];
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export declare class ModerationService {
    private config;
    private prisma;
    private openaiApiKey;
    constructor(config: ConfigService, prisma: PrismaService);
    checkContent(text: string): Promise<ModerationResult>;
    validateResponse(text: string): Promise<ModerationResult>;
    logViolation(userId: string, reason: string, content: string): Promise<void>;
    moderateContent(text: string): Promise<ModerationResult>;
    private reportToNCMEC;
    getUserMessage(result: ModerationResult): string;
}
export {};
