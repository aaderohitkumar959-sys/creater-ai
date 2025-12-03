import { Global, Module } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { AdRewardController } from './ad-reward.controller';

@Global()
@Module({
    providers: [CoinService],
    controllers: [CoinController, AdRewardController],
    exports: [CoinService],
})
export class CoinModule { }
