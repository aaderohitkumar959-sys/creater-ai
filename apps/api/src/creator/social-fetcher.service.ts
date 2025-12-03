import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

@Injectable()
export class SocialFetcherService {
    constructor(private config: ConfigService) { }

    async fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
        // Extract video ID from URL
        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
            throw new HttpException('Invalid YouTube URL', HttpStatus.BAD_REQUEST);
        }

        // Get YouTube API key from config
        const apiKey = this.config.get<string>('YOUTUBE_API_KEY');

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
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            };
        }

        try {
            // Call YouTube Data API v3
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`
            );

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                throw new HttpException('Video not found or is private', HttpStatus.NOT_FOUND);
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
        } catch (error) {
            console.error('YouTube fetch error:', error);
            throw new HttpException(
                'Failed to fetch YouTube metadata',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private extractYouTubeVideoId(url: string): string | null {
        // Support various YouTube URL formats
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

    sanitizeContent(content: string): string {
        // Remove emails
        content = content.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');

        // Remove phone numbers (basic patterns)
        content = content.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

        // Remove URLs (except YouTube links which are already captured)
        content = content.replace(/https?:\/\/[^\s]+/g, '[LINK]');

        return content;
    }

    extractTextFromTranscript(transcript: string[]): string {
        // Combine transcript lines, removing timestamps and cleanup
        return transcript
            .map(line => line.replace(/\[\d+:\d+\]/g, '')) // Remove timestamps
            .join(' ')
            .trim();
    }
}
