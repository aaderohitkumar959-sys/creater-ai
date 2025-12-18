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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialFetcherController = void 0;
const common_1 = require("@nestjs/common");
const social_fetcher_service_1 = require("./social-fetcher.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SocialFetcherController = class SocialFetcherController {
    socialFetcher;
    constructor(socialFetcher) {
        this.socialFetcher = socialFetcher;
    }
    async fetchMetadata(body) {
        if (body.platform !== 'youtube') {
            return { error: 'Only YouTube is currently supported' };
        }
        const metadata = await this.socialFetcher.fetchYouTubeMetadata(body.url);
        const sanitizedDescription = this.socialFetcher.sanitizeContent(metadata.description);
        return {
            ...metadata,
            description: sanitizedDescription,
            suggestedSamples: this.generateSuggestedSamples(sanitizedDescription),
        };
    }
    generateSuggestedSamples(description) {
        const sentences = description
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 20);
        return sentences.slice(0, 3).map((s) => s.trim());
    }
};
exports.SocialFetcherController = SocialFetcherController;
__decorate([
    (0, common_1.Post)('fetch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialFetcherController.prototype, "fetchMetadata", null);
exports.SocialFetcherController = SocialFetcherController = __decorate([
    (0, common_1.Controller)('creator/social'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [social_fetcher_service_1.SocialFetcherService])
], SocialFetcherController);
//# sourceMappingURL=social-fetcher.controller.js.map