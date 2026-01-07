"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ModerationService", {
    enumerable: true,
    get: function() {
        return ModerationService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _firestoreservice = require("../prisma/firestore.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ModerationService = class ModerationService {
    /**
   * Check content (wrapper for moderateContent)
   * Used by chat service
   */ async checkContent(text) {
        return this.moderateContent(text);
    }
    /**
   * Validate AI response (same moderation logic)
   * Used by chat service
   */ async validateResponse(text) {
        return this.moderateContent(text);
    }
    /**
   * Log moderation violation to database
   * Used by chat service
   */ async logViolation(userId, reason, content) {
        try {
            const violationTypeMap = {
                'ILLEGAL_CONTENT': 'ILLEGAL',
                'HATE_SPEECH': 'HATE_SPEECH',
                'VIOLENCE': 'VIOLENCE',
                'SEXUAL_CONTENT': 'SEXUAL_CONTENT',
                'SELF_HARM': 'SELF_HARM'
            };
            const violationType = violationTypeMap[reason] || 'OTHER';
            await this.firestore.create('violations', {
                userId,
                type: violationType,
                severity: 'MEDIUM',
                note: `Content moderation: ${reason}`,
                contentSnippet: content.substring(0, 100),
                status: 'PENDING'
            });
        } catch (error) {
            console.error('[MODERATION] Failed to log violation:', error);
        }
    }
    /**
   * Moderate content using OpenAI Moderation API
   * Blocks illegal and harmful content
   */ async moderateContent(text) {
        if (!this.openaiApiKey) {
            return {
                blocked: false
            };
        }
        try {
            const response = await fetch('https://api.openai.com/v1/moderations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    input: text
                })
            });
            if (!response.ok) return {
                blocked: false
            };
            const data = await response.json();
            const result = data.results[0];
            // CRITICAL: Block sexual content involving minors
            if (result.categories['sexual/minors']) {
                await this.reportToNCMEC(text);
                return {
                    blocked: true,
                    reason: 'ILLEGAL_CONTENT',
                    categories: [
                        'sexual/minors'
                    ],
                    severity: 'CRITICAL'
                };
            }
            // HIGH: Block hate speech and violence
            if (result.categories.hate || result.categories['hate/threatening']) {
                return {
                    blocked: true,
                    reason: 'HATE_SPEECH',
                    categories: [
                        'hate'
                    ],
                    severity: 'HIGH'
                };
            }
            if (result.categories.violence || result.categories['violence/graphic']) {
                return {
                    blocked: true,
                    reason: 'VIOLENCE',
                    categories: [
                        'violence'
                    ],
                    severity: 'HIGH'
                };
            }
            // MEDIUM: Block sexual content (not involving minors)
            if (result.categories.sexual) {
                return {
                    blocked: true,
                    reason: 'SEXUAL_CONTENT',
                    categories: [
                        'sexual'
                    ],
                    severity: 'MEDIUM'
                };
            }
            // LOW: Self-harm content (soft block with resources)
            if (result.categories['self-harm']) {
                return {
                    blocked: true,
                    reason: 'SELF_HARM',
                    categories: [
                        'self-harm'
                    ],
                    severity: 'LOW'
                };
            }
            // Content is safe
            return {
                blocked: false
            };
        } catch (error) {
            return {
                blocked: false
            };
        }
    }
    /**
   * Report CSAM to NCMEC (National Center for Missing & Exploited Children)
   * LEGAL REQUIREMENT in the United States
   */ async reportToNCMEC(content) {
        // TODO: Implement actual NCMEC reporting
        // This is a placeholder - real implementation requires:
        // 1. NCMEC CyberTipline account
        // 2. XML report submission
        // 3. Store evidence securely
        // 4. Follow legal retention requirements
        console.error('[NCMEC] REPORT REQUIRED (Mock):', {
            timestamp: new Date().toISOString()
        });
    // For now, send alert email to admin
    // In production, this MUST trigger actual NCMEC report
    }
    /**
   * Get user-friendly error message based on moderation reason
   */ getUserMessage(result) {
        switch(result.reason){
            case 'ILLEGAL_CONTENT':
                return 'This content violates our terms and has been reported.';
            case 'HATE_SPEECH':
                return 'This message contains hate speech.';
            case 'VIOLENCE':
                return 'This message contains violent content.';
            case 'SEXUAL_CONTENT':
                return 'This message contains inappropriate sexual content.';
            case 'SELF_HARM':
                return 'We detected content related to self-harm. Please reach out to 988.';
            default:
                return 'This message violates our community guidelines.';
        }
    }
    constructor(config, firestore){
        this.config = config;
        this.firestore = firestore;
        this.openaiApiKey = this.config.get('OPENAI_API_KEY') || '';
    }
};
ModerationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService,
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], ModerationService);
