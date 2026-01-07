"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SocialFetcherService", {
    enumerable: true,
    get: function() {
        return SocialFetcherService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SocialFetcherService = class SocialFetcherService {
    async fetchYouTubeMetadata(url) {
        // Extract video ID from URL
        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
            throw new _common.HttpException('Invalid YouTube URL', _common.HttpStatus.BAD_REQUEST);
        }
        // Get YouTube API key from config
        const apiKey = this.config.get('YOUTUBE_API_KEY');
        if (!apiKey) {
            // Fallback: Return basic metadata without API call
            console.warn('YouTube API key not configured, returning basic metadata');
            return {
                platform: 'youtube',
                url,
                videoId,
                title: 'YouTube Video',
                description: 'Please configure YOUTUBE_API_KEY to fetch full metadata',
                channelName: 'Unknown',
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
        }
        try {
            // Call YouTube Data API v3
            const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`);
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.items || data.items.length === 0) {
                throw new _common.HttpException('Video not found or is private', _common.HttpStatus.NOT_FOUND);
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
                publishedAt: snippet.publishedAt
            };
        } catch (error) {
            console.error('YouTube fetch error:', error);
            throw new _common.HttpException('Failed to fetch YouTube metadata', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    extractYouTubeVideoId(url) {
        // Support various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/
        ];
        for (const pattern of patterns){
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }
    sanitizeContent(content) {
        // Remove emails
        content = content.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
        // Remove phone numbers (basic patterns)
        content = content.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
        // Remove URLs (except YouTube links which are already captured)
        content = content.replace(/https?:\/\/[^\s]+/g, '[LINK]');
        return content;
    }
    extractTextFromTranscript(transcript) {
        // Combine transcript lines, removing timestamps and cleanup
        return transcript.map((line)=>line.replace(/\[\d+:\d+\]/g, '')) // Remove timestamps
        .join(' ').trim();
    }
    constructor(config){
        this.config = config;
    }
};
SocialFetcherService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], SocialFetcherService);
