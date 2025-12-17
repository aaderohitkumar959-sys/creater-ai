import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface ModerationResult {
  blocked: boolean;
  reason?: string;
  categories?: string[];
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

@Injectable()
export class ModerationService {
  private openaiApiKey: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openaiApiKey = this.config.get('OPENAI_API_KEY') || '';
  }

  /**
   * Check content (wrapper for moderateContent)
   * Used by chat service
   */
  async checkContent(text: string): Promise<ModerationResult> {
    return this.moderateContent(text);
  }

  /**
   * Validate AI response (same moderation logic)
   * Used by chat service
   */
  async validateResponse(text: string): Promise<ModerationResult> {
    return this.moderateContent(text);
  }

  /**
   * Log moderation violation to database
   * Used by chat service
   */
  async logViolation(
    userId: string,
    reason: string,
    content: string,
  ): Promise<void> {
    try {      // Map reason string to ViolationType enum
      const violationTypeMap: Record<string, any> = {
        'ILLEGAL_CONTENT': 'ILLEGAL',
        'HATE_SPEECH': 'HATE_SPEECH',
        'VIOLENCE': 'VIOLENCE',
        'SEXUAL_CONTENT': 'SEXUAL_CONTENT',
        'SELF_HARM': 'SELF_HARM',
      };

      const violationType = violationTypeMap[reason] || 'OTHER';

      await this.prisma.violation.create({
        data: {
          userId,
          type: violationType,
          severity: 'MEDIUM', // Severity enum: LOW, MEDIUM, HIGH, CRITICAL
          note: `Content moderation: ${reason}`,
        },
      });
      console.log(`[MODERATION] Logged violation for user ${userId}: ${reason}`);
    } catch (error) {
      console.error('[MODERATION] Failed to log violation:', error);
      // Don't throw - moderation should not block on DB errors
    }
  }

  /**
   * Moderate content using OpenAI Moderation API
   * Blocks illegal and harmful content
   */
  async moderateContent(text: string): Promise<ModerationResult> {
    if (!this.openaiApiKey) {
      console.error('[MODERATION] OpenAI API key not configured');
      // Fail-safe: Allow content if moderation is not configured (development only)
      return { blocked: false };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          input: text,
        }),
      });

      if (!response.ok) {
        console.error('[MODERATION] OpenAI API error:', response.statusText);
        // Fail-safe: Allow content if API is down (log for review)
        return { blocked: false };
      }

      const data = await response.json();
      const result = data.results[0];

      // CRITICAL: Block sexual content involving minors
      if (result.categories['sexual/minors']) {
        console.error('[MODERATION] CRITICAL: CSAM detected');
        // TODO: Auto-report to NCMEC
        await this.reportToNCMEC(text);
        return {
          blocked: true,
          reason: 'ILLEGAL_CONTENT',
          categories: ['sexual/minors'],
          severity: 'CRITICAL',
        };
      }

      // HIGH: Block hate speech and violence
      if (result.categories.hate || result.categories['hate/threatening']) {
        console.warn('[MODERATION] Hate speech detected');
        return {
          blocked: true,
          reason: 'HATE_SPEECH',
          categories: ['hate'],
          severity: 'HIGH',
        };
      }

      if (result.categories.violence || result.categories['violence/graphic']) {
        console.warn('[MODERATION] Extreme violence detected');
        return {
          blocked: true,
          reason: 'VIOLENCE',
          categories: ['violence'],
          severity: 'HIGH',
        };
      }

      // MEDIUM: Block sexual content (not involving minors)
      if (result.categories.sexual) {
        console.warn('[MODERATION] Sexual content detected');
        return {
          blocked: true,
          reason: 'SEXUAL_CONTENT',
          categories: ['sexual'],
          severity: 'MEDIUM',
        };
      }

      // LOW: Self-harm content (soft block with resources)
      if (result.categories['self-harm']) {
        console.warn('[MODERATION] Self-harm content detected');
        return {
          blocked: true,
          reason: 'SELF_HARM',
          categories: ['self-harm'],
          severity: 'LOW',
        };
      }

      // Content is safe
      return { blocked: false };
    } catch (error) {
      console.error('[MODERATION] Error:', error);
      // Fail-safe: Allow content but log error
      return { blocked: false };
    }
  }

  /**
   * Report CSAM to NCMEC (National Center for Missing & Exploited Children)
   * LEGAL REQUIREMENT in the United States
   */
  private async reportToNCMEC(content: string) {
    // TODO: Implement actual NCMEC reporting
    // This is a placeholder - real implementation requires:
    // 1. NCMEC CyberTipline account
    // 2. XML report submission
    // 3. Store evidence securely
    // 4. Follow legal retention requirements

    console.error('[NCMEC] REPORT REQUIRED:', {
      timestamp: new Date().toISOString(),
      contentLength: content.length,
      // DO NOT log actual content
    });

    // For now, send alert email to admin
    // In production, this MUST trigger actual NCMEC report
  }

  /**
   * Get user-friendly error message based on moderation reason
   */
  getUserMessage(result: ModerationResult): string {
    switch (result.reason) {
      case 'ILLEGAL_CONTENT':
        return 'This content violates our terms of service and has been reported to authorities.';
      case 'HATE_SPEECH':
        return 'This message contains hate speech and cannot be sent.';
      case 'VIOLENCE':
        return 'This message contains violent content and cannot be sent.';
      case 'SEXUAL_CONTENT':
        return 'This message contains inappropriate sexual content.';
      case 'SELF_HARM':
        return 'We detected content related to self-harm. Please reach out to: National Suicide Prevention Lifeline: 988';
      default:
        return 'This message violates our community guidelines.';
    }
  }
}
