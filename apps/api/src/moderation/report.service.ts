import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum ReportReason {
    HARASSMENT = 'HARASSMENT',
    SPAM = 'SPAM',
    INAPPROPRIATE = 'INAPPROPRIATE',
    ILLEGAL = 'ILLEGAL',
    OTHER = 'OTHER',
}

export enum ReportStatus {
    PENDING = 'PENDING',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Injectable()
export class ReportService {
    constructor(private prisma: PrismaService) { }

    /**
     * Submit a report for content/user
     */
    async submitReport(
        reporterId: string,
        data: {
            messageId?: string;
            conversationId?: string;
            reportedUserId?: string;
            reason: ReportReason;
            details?: string;
        },
    ) {
        // Create report
        const report = await this.prisma.report.create({
            data: {
                reporterId,
                messageId: data.messageId,
                conversationId: data.conversationId,
                reportedUserId: data.reportedUserId,
                reason: data.reason,
                details: data.details,
                status: ReportStatus.PENDING,
            },
        });

        // Check if user has multiple reports (auto-flag)
        if (data.reportedUserId) {
            const reportCount = await this.prisma.report.count({
                where: {
                    reportedUserId: data.reportedUserId,
                    status: ReportStatus.PENDING,
                },
            });

            // Auto-review if 3+ reports
            if (reportCount >= 3) {
                await this.prisma.report.update({
                    where: { id: report.id },
                    data: { status: ReportStatus.UNDER_REVIEW },
                });

                console.log('[REPORT] Auto-flagged user for review:', {
                    userId: data.reportedUserId,
                    reportCount,
                });
            }
        }

        console.log('[REPORT] Report submitted:', {
            reportId: report.id,
            reporter: reporterId,
            reason: data.reason,
        });

        return report;
    }

    /**
     * Get all pending reports (admin)
     */
    async getPendingReports(limit: number = 50) {
        return await this.prisma.report.findMany({
            where: {
                status: {
                    in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW],
                },
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reported: { // Fixed: was reportedUser, but schema uses 'reported'
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                message: {
                    select: {
                        content: true,
                        sender: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Approve report and take action (admin)
     */
    async approveReport(
        reportId: string,
        adminId: string,
        action: 'BAN_USER' | 'DELETE_MESSAGE' | 'WARNING',
    ) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new Error('Report not found');
        }

        // Update report status
        await this.prisma.report.update({
            where: { id: reportId },
            data: {
                status: ReportStatus.APPROVED,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                actionTaken: action,
            },
        });

        // Take action based on decision
        switch (action) {
            case 'BAN_USER':
                if (report.reportedUserId) {
                    await this.banUser(report.reportedUserId);
                }
                break;

            case 'DELETE_MESSAGE':
                if (report.messageId) {
                    await this.deleteMessage(report.messageId);
                }
                break;

            case 'WARNING':
                // Log warning, could send email
                console.log('[REPORT] Warning issued to user:', {
                    userId: report.reportedUserId,
                });
                break;
        }

        console.log('[REPORT] Report approved:', {
            reportId,
            action,
            adminId,
        });
    }

    /**
     * Reject report (admin)
     */
    async rejectReport(reportId: string, adminId: string) {
        await this.prisma.report.update({
            where: { id: reportId },
            data: {
                status: ReportStatus.REJECTED,
                reviewedBy: adminId,
                reviewedAt: new Date(),
            },
        });

        console.log('[REPORT] Report rejected:', {
            reportId,
            adminId,
        });
    }

    /**
     * Ban user
     */
    private async banUser(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true },
        });

        console.log('[REPORT] User banned:', userId);
    }

    /**
     * Delete message
     */
    private async deleteMessage(messageId: string) {
        await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true },
        });

        console.log('[REPORT] Message deleted:', messageId);
    }

    /**
     * Get report statistics (admin)
     */
    async getReportStats() {
        const total = await this.prisma.report.count();
        const pending = await this.prisma.report.count({
            where: { status: ReportStatus.PENDING },
        });
        const underReview = await this.prisma.report.count({
            where: { status: ReportStatus.UNDER_REVIEW },
        });
        const approved = await this.prisma.report.count({
            where: { status: ReportStatus.APPROVED },
        });
        const rejected = await this.prisma.report.count({
            where: { status: ReportStatus.REJECTED },
        });

        return {
            total,
            pending,
            underReview,
            approved,
            rejected,
        };
    }
}
