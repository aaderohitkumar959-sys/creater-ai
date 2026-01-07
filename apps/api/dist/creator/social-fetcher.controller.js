"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SocialFetcherController", {
    enumerable: true,
    get: function() {
        return SocialFetcherController;
    }
});
const _common = require("@nestjs/common");
const _socialfetcherservice = require("./social-fetcher.service");
const _jwtauthguard = require("../auth/jwt-auth.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let SocialFetcherController = class SocialFetcherController {
    async fetchMetadata(body) {
        if (body.platform !== 'youtube') {
            return {
                error: 'Only YouTube is currently supported'
            };
        }
        const metadata = await this.socialFetcher.fetchYouTubeMetadata(body.url);
        // Sanitize description
        const sanitizedDescription = this.socialFetcher.sanitizeContent(metadata.description);
        return {
            ...metadata,
            description: sanitizedDescription,
            suggestedSamples: this.generateSuggestedSamples(sanitizedDescription)
        };
    }
    generateSuggestedSamples(description) {
        // Extract first few sentences as suggested training samples
        const sentences = description.split(/[.!?]+/).filter((s)=>s.trim().length > 20);
        return sentences.slice(0, 3).map((s)=>s.trim());
    }
    constructor(socialFetcher){
        this.socialFetcher = socialFetcher;
    }
};
_ts_decorate([
    (0, _common.Post)('fetch'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof FetchSocialRequest === "undefined" ? Object : FetchSocialRequest
    ]),
    _ts_metadata("design:returntype", Promise)
], SocialFetcherController.prototype, "fetchMetadata", null);
SocialFetcherController = _ts_decorate([
    (0, _common.Controller)('creator/social'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socialfetcherservice.SocialFetcherService === "undefined" ? Object : _socialfetcherservice.SocialFetcherService
    ])
], SocialFetcherController);
