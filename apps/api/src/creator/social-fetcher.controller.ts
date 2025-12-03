import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SocialFetcherService } from './social-fetcher.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface FetchSocialRequest {
    url: string;
    platform: 'youtube';
}

@Controller('creator/social')
@UseGuards(JwtAuthGuard)
export class SocialFetcherController {
    constructor(private readonly socialFetcher: SocialFetcherService) { }

    @Post('fetch')
    async fetchMetadata(@Body() body: FetchSocialRequest) {
        if (body.platform !== 'youtube') {
            return { error: 'Only YouTube is currently supported' };
        }

        const metadata = await this.socialFetcher.fetchYouTubeMetadata(body.url);

        // Sanitize description
        const sanitizedDescription = this.socialFetcher.sanitizeContent(metadata.description);

        return {
            ...metadata,
            description: sanitizedDescription,
            suggestedSamples: this.generateSuggestedSamples(sanitizedDescription),
        };
    }

    private generateSuggestedSamples(description: string): string[] {
        // Extract first few sentences as suggested training samples
        const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 3).map(s => s.trim());
    }
}
