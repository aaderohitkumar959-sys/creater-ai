import { CoinService } from './coin.service';
interface AdRewardRequest {
    adToken: string;
    adProvider: 'admob' | 'unity' | 'test';
}
export declare class AdRewardController {
    private readonly coinService;
    constructor(coinService: CoinService);
    validateAdReward(body: AdRewardRequest, req: any): Promise<{
        success: boolean;
        error: string;
        coinsEarned?: undefined;
        newBalance?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        coinsEarned: number;
        newBalance: number;
        message: string;
        error?: undefined;
    }>;
    checkAvailability(req: any): Promise<{
        canEarn: boolean;
        adsWatchedToday: number;
        maxAdsPerDay: number;
        coinsPerAd: number;
    }>;
}
export {};
