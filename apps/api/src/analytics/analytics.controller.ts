import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('creator/:userId/overview')
    async getOverview(@Param('userId') userId: string) {
        return this.analyticsService.getCreatorOverview(userId);
    }

    @Get('creator/:userId/earnings')
    async getEarnings(@Param('userId') userId: string, @Query('days') days?: string) {
        const daysNum = days ? parseInt(days) : 30;
        return this.analyticsService.getEarningsTimeSeries(userId, daysNum);
    }

    @Get('creator/:userId/messages')
    async getMessages(@Param('userId') userId: string) {
        return this.analyticsService.getMessageStats(userId);
    }

    @Get('creator/:userId/personas')
    async getPersonas(@Param('userId') userId: string) {
        return this.analyticsService.getPersonaPerformance(userId);
    }
}
