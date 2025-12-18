import { SocialFetcherService } from './social-fetcher.service';
interface FetchSocialRequest {
    url: string;
    platform: 'youtube';
}
export declare class SocialFetcherController {
    private readonly socialFetcher;
    constructor(socialFetcher: SocialFetcherService);
    fetchMetadata(body: FetchSocialRequest): Promise<{
        error: string;
    } | {
        description: string;
        suggestedSamples: string[];
        platform: "youtube";
        url: string;
        title: string;
        channelName: string;
        videoId: string;
        thumbnail: string;
        duration?: string;
        viewCount?: number;
        publishedAt?: string;
        error?: undefined;
    }>;
    private generateSuggestedSamples;
}
export {};
