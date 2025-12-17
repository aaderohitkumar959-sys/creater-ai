import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReportService, ReportReason } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reports')
export class ReportController {
    constructor(private reportService: ReportService) { }

    /**
     * Submit a report
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    async submitReport(
        @Req() req: any,
        @Body()
        body: {
            messageId?: string;
            conversationId?: string;
            reportedUserId?: string;
            reason: ReportReason;
            details?: string;
        },
    ) {
        const reporterId = req.user.id;

        const report = await this.reportService.submitReport(reporterId, body);

        return {
            message: 'Report submitted successfully. We will review it shortly.',
            reportId: report.id,
        };
    }

    /**
     * Get pending reports (admin only)
     */
    @Get('pending')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getPendingReports() {
        return await this.reportService.getPendingReports();
    }

    /**
     * Get report statistics (admin only)
     */
    @Get('stats')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getReportStats() {
        return await this.reportService.getReportStats();
    }

    /**
     * Approve report (admin only)
     */
    @Patch(':id/approve')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async approveReport(
        @Param('id') reportId: string,
        @Req() req: any,
        @Body() body: { action: 'BAN_USER' | 'DELETE_MESSAGE' | 'WARNING' },
    ) {
        const adminId = req.user.id;

        await this.reportService.approveReport(reportId, adminId, body.action);

        return {
            message: `Report approved. Action taken: ${body.action}`,
        };
    }

    /**
     * Reject report (admin only)
     */
    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async rejectReport(@Param('id') reportId: string, @Req() req: any) {
        const adminId = req.user.id;

        await this.reportService.rejectReport(reportId, adminId);

        return {
            message: 'Report rejected',
        };
    }
}
