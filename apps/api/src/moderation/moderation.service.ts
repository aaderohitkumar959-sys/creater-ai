import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OpenAIModerationProvider } from './providers/openai-moderation.provider';
import { ViolationType, Severity, ModerationAction } from '@prisma/client';

@Injectable()
export class ModerationService {
    private provider: OpenAIModerationProvider;

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        const apiKey = this.config.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.provider = new OpenAIModerationProvider(apiKey);
        }
    }

    async checkContent(content: string): Promise<{
        allowed: boolean;
        flagged: boolean;
        categories: string[];
        score: number;
    }> {
        if (!this.provider) {
            // If no provider configured, allow everything (dev mode)
            // In production, you might want to block or use regex fallback
            return { allowed: true, flagged: false, categories: [], score: 0 };
        }

        const result = await this.provider.moderateContent(content);

        const blockedCategories = Object.keys(result.categories).filter(
            cat => result.categories[cat]
        );

        // Calculate max score
        const maxScore = Math.max(...Object.values(result.category_scores));

        return {
            allowed: !result.flagged,
            flagged: result.flagged,
            categories: blockedCategories,
            score: maxScore,
        };
    }

    async logViolation(userId: string, content: string, categories: string[]) {
        // Map OpenAI categories to our ViolationType
        // This is a simplification, you might want more complex mapping
        const type = this.mapCategoryToViolationType(categories[0]);
        const severity = this.calculateSeverity(categories);

        await this.prisma.violation.create({
            data: {
                userId,
                type,
                severity,
                content,
                categories,
            },
        });

        // Check for auto-ban
        await this.checkAutoModeration(userId);
    }

    async validateResponse(response: string): Promise<{
        safe: boolean;
        issues: string[];
    }> {
        const check = await this.checkContent(response);
        return {
            safe: check.allowed,
            issues: check.categories,
        };
    }

    private mapCategoryToViolationType(category: string): ViolationType {
        if (!category) return ViolationType.OTHER;
        if (category.includes('hate')) return ViolationType.HATE_SPEECH;
        if (category.includes('harassment')) return ViolationType.HARASSMENT;
        if (category.includes('sexual')) return ViolationType.SEXUAL_CONTENT;
        if (category.includes('violence')) return ViolationType.VIOLENCE;
        if (category.includes('self-harm')) return ViolationType.SELF_HARM;
        return ViolationType.OTHER;
    }

    private calculateSeverity(categories: string[]): Severity {
        if (categories.some(c => c.includes('minors') || c.includes('graphic'))) {
            return Severity.CRITICAL;
        }
        if (categories.some(c => c.includes('hate') || c.includes('violence'))) {
            return Severity.HIGH;
        }
        return Severity.MEDIUM;
    }

    private async checkAutoModeration(userId: string) {
        const violations = await this.prisma.violation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        if (violations.length >= 3) {
            // Auto-ban logic
            // For now, just log it or implement simple temp ban
            // await this.banUser(userId, 'TEMP_BAN', 'Repeated violations');
        }
    }
}
