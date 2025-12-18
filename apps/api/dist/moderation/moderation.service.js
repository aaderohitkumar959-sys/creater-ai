"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let ModerationService = class ModerationService {
    config;
    prisma;
    openaiApiKey;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.openaiApiKey = this.config.get('OPENAI_API_KEY') || '';
    }
    async checkContent(text) {
        return this.moderateContent(text);
    }
    async validateResponse(text) {
        return this.moderateContent(text);
    }
    async logViolation(userId, reason, content) {
        try {
            const violationTypeMap = {
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
                    severity: 'MEDIUM',
                    note: `Content moderation: ${reason}`,
                },
            });
            console.log(`[MODERATION] Logged violation for user ${userId}: ${reason}`);
        }
        catch (error) {
            console.error('[MODERATION] Failed to log violation:', error);
        }
    }
    async moderateContent(text) {
        if (!this.openaiApiKey) {
            console.error('[MODERATION] OpenAI API key not configured');
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
                return { blocked: false };
            }
            const data = await response.json();
            const result = data.results[0];
            if (result.categories['sexual/minors']) {
                console.error('[MODERATION] CRITICAL: CSAM detected');
                await this.reportToNCMEC(text);
                return {
                    blocked: true,
                    reason: 'ILLEGAL_CONTENT',
                    categories: ['sexual/minors'],
                    severity: 'CRITICAL',
                };
            }
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
            if (result.categories.sexual) {
                console.warn('[MODERATION] Sexual content detected');
                return {
                    blocked: true,
                    reason: 'SEXUAL_CONTENT',
                    categories: ['sexual'],
                    severity: 'MEDIUM',
                };
            }
            if (result.categories['self-harm']) {
                console.warn('[MODERATION] Self-harm content detected');
                return {
                    blocked: true,
                    reason: 'SELF_HARM',
                    categories: ['self-harm'],
                    severity: 'LOW',
                };
            }
            return { blocked: false };
        }
        catch (error) {
            console.error('[MODERATION] Error:', error);
            return { blocked: false };
        }
    }
    async reportToNCMEC(content) {
        console.error('[NCMEC] REPORT REQUIRED:', {
            timestamp: new Date().toISOString(),
            contentLength: content.length,
        });
    }
    getUserMessage(result) {
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
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map