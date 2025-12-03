import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CoinService } from './coin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AdRewardRequest {
    adToken: string; // Token from ad provider
    adProvider: 'admob' | 'unity' | 'test';
}

@Controller('coin/ad-reward')
@UseGuards(JwtAuthGuard)
export class AdRewardController {
    constructor(private readonly coinService: CoinService) { }

    @Post('validate')
    async validateAdReward(@Body() body: AdRewardRequest, @Request() req: any) {
        const userId = req.user.id;

        // In production, validate the token with the ad provider's server
        // For now, we'll use a simple validation for test tokens
        if (body.adProvider === 'test' && body.adToken.startsWith('test_')) {
            // Check if user has exceeded daily ad limit
            const canEarn = await this.coinService.canEarnAdReward(userId);

            if (!canEarn) {
                return {
                    success: false,
                    error: 'Daily ad limit reached. Try again tomorrow!',
                };
            }

            // Grant reward (e.g., 10 coins per ad)
            const newBalance = await this.coinService.grantAdReward(userId, 10);

            return {
                success: true,
                coinsEarned: 10,
                newBalance,
                message: 'Congratulations! You earned 10 coins.',
            };
        }

        // TODO: Add real validation for AdMob, Unity Ads, etc.
        return {
            success: false,
            error: 'Invalid ad token',
        };
    }

    @Post('check-availability')
    async checkAvailability(@Request() req: any) {
        const userId = req.user.id;
        const canEarn = await this.coinService.canEarnAdReward(userId);
        const adsWatchedToday = await this.coinService.getAdsWatchedToday(userId);

        return {
            canEarn,
            adsWatchedToday,
            maxAdsPerDay: 5,
            coinsPerAd: 10,
        };
    }
}
