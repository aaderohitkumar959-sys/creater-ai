import { ConfigService } from '@nestjs/config';
interface YouTubeMetadata {
    platform: 'youtube';
    url: string;
    title: string;
    description: string;
    channelName: string;
    videoId: string;
    thumbnail: string;
    duration?: string;
    viewCount?: number;
    publishedAt?: string;
}
export declare class SocialFetcherService {
    private config;
    constructor(config: ConfigService);
    fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata>;
    private extractYouTubeVideoId;
    sanitizeContent(content: string): string;
    extractTextFromTranscript(transcript: string[]): string;
}
export {};
