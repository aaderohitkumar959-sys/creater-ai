import { PrismaService } from '../prisma/prisma.service';
export declare enum ReportReason {
    HARASSMENT = "HARASSMENT",
    SPAM = "SPAM",
    INAPPROPRIATE = "INAPPROPRIATE",
    ILLEGAL = "ILLEGAL",
    OTHER = "OTHER"
}
export declare enum ReportStatus {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class ReportService {
    private prisma;
    constructor(prisma: PrismaService);
    submitReport(reporterId: string, data: {
        messageId?: string;
        conversationId?: string;
        reportedUserId?: string;
        reason: ReportReason;
        details?: string;
    }): Promise<{
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
    }>;
    getPendingReports(limit?: number): Promise<({
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
    approveReport(reportId: string, adminId: string, action: 'BAN_USER' | 'DELETE_MESSAGE' | 'WARNING'): Promise<void>;
    rejectReport(reportId: string, adminId: string): Promise<void>;
    private banUser;
    private deleteMessage;
    getReportStats(): Promise<{
        total: number;
        pending: number;
        underReview: number;
        approved: number;
        rejected: number;
    }>;
}
