import { ReportService, ReportReason } from './report.service';
export declare class ReportController {
    private reportService;
    constructor(reportService: ReportService);
    submitReport(req: any, body: {
        messageId?: string;
        conversationId?: string;
        reportedUserId?: string;
        reason: ReportReason;
        details?: string;
    }): Promise<{
        message: string;
        reportId: string;
    }>;
    getPendingReports(): Promise<({
        message: {
            createdAt: Date;
            content: string;
            sender: import(".prisma/client").$Enums.Role;
        } | null;
        reporter: {
            id: string;
            email: string | null;
            name: string | null;
        };
        reported: {
            id: string;
            email: string | null;
            name: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        reason: string;
        conversationId: string | null;
        details: string | null;
        reviewedAt: Date | null;
        actionTaken: string | null;
        reporterId: string;
        reportedUserId: string | null;
        messageId: string | null;
        reviewedBy: string | null;
    })[]>;
    getReportStats(): Promise<{
        total: number;
        pending: number;
        underReview: number;
        approved: number;
        rejected: number;
    }>;
    approveReport(reportId: string, req: any, body: {
        action: 'BAN_USER' | 'DELETE_MESSAGE' | 'WARNING';
    }): Promise<{
        message: string;
    }>;
    rejectReport(reportId: string, req: any): Promise<{
        message: string;
    }>;
}
