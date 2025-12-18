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
exports.SocialFetcherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SocialFetcherService = class SocialFetcherService {
    config;
    constructor(config) {
        this.config = config;
    }
    async fetchYouTubeMetadata(url) {
        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
            throw new common_1.HttpException('Invalid YouTube URL', common_1.HttpStatus.BAD_REQUEST);
        }
        const apiKey = this.config.get('YOUTUBE_API_KEY');
        if (!apiKey) {
            console.warn('YouTube API key not configured, returning basic metadata');
            return {
                platform: 'youtube',
                url,
                videoId,
                title: 'YouTube Video',
                description: 'Please configure YOUTUBE_API_KEY to fetch full metadata',
                channelName: 'Unknown',
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            };
        }
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`);
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.items || data.items.length === 0) {
                throw new common_1.HttpException('Video not found or is private', common_1.HttpStatus.NOT_FOUND);
            }
            const video = data.items[0];
            const snippet = video.snippet;
            const statistics = video.statistics;
            return {
                platform: 'youtube',
                url,
                videoId,
                title: snippet.title,
                description: snippet.description,
                channelName: snippet.channelTitle,
                thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
                duration: video.contentDetails?.duration,
                viewCount: parseInt(statistics?.viewCount || '0'),
                publishedAt: snippet.publishedAt,
            };
        }
        catch (error) {
            console.error('YouTube fetch error:', error);
            throw new common_1.HttpException('Failed to fetch YouTube metadata', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    extractYouTubeVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }
    sanitizeContent(content) {
        content = content.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
        content = content.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
        content = content.replace(/https?:\/\/[^\s]+/g, '[LINK]');
        return content;
    }
    extractTextFromTranscript(transcript) {
        return transcript
            .map((line) => line.replace(/\[\d+:\d+\]/g, ''))
            .join(' ')
            .trim();
    }
};
exports.SocialFetcherService = SocialFetcherService;
exports.SocialFetcherService = SocialFetcherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SocialFetcherService);
//# sourceMappingURL=social-fetcher.service.js.map