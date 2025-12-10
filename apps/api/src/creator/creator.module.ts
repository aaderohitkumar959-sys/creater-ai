import { Module } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { CreatorController } from './creator.controller';
import { SocialFetcherService } from './social-fetcher.service';
import { SocialFetcherController } from './social-fetcher.controller';

@Module({
  providers: [CreatorService, SocialFetcherService],
  controllers: [CreatorController, SocialFetcherController],
  exports: [CreatorService],
})
export class CreatorModule {}
