import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

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
    constructor(private firestore: FirestoreService) { }

    async submitReport(reporterId: string, data: { messageId?: string, conversationId?: string, reportedUserId?: string, reason: ReportReason, details?: string }) {
        const reportData = {
            reporterId,
            messageId: data.messageId || null,
            conversationId: data.conversationId || null,
            reportedUserId: data.reportedUserId || null,
            type: data.messageId ? 'MESSAGE' : 'USER',
            category: 'GENERAL',
            reason: data.reason,
            details: data.details || '',
            status: ReportStatus.PENDING,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const report = await this.firestore.create('reports', reportData);

        if (data.reportedUserId) {
            const reportCount = await this.firestore.count('reports', (ref) =>
                ref.where('reportedUserId', '==', data.reportedUserId).where('status', '==', ReportStatus.PENDING)
            );

            if (reportCount >= 3) {
                await this.firestore.update('reports', report.id, { status: ReportStatus.UNDER_REVIEW });
            }
        }

        return report;
    }

    async getPendingReports(limit: number = 50) {
        const reports = await this.firestore.findMany('reports', (ref) =>
            ref.where('status', 'in', [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW])
                .orderBy('createdAt', 'desc')
                .limit(limit)
        ) as any[];

        return Promise.all(reports.map(async (r) => {
            const [reporter, reported] = await Promise.all([
                this.firestore.findUnique('users', r.reporterId),
                r.reportedUserId ? this.firestore.findUnique('users', r.reportedUserId) : Promise.resolve(null),
            ]);

            let message = null;
            if (r.conversationId && r.messageId) {
                message = await this.firestore.findUnique(`conversations/${r.conversationId}/messages`, r.messageId);
            }

            return { ...r, reporter, reported, message };
        }));
    }

    async approveReport(reportId: string, adminId: string, action: 'BAN_USER' | 'DELETE_MESSAGE' | 'WARNING') {
        const report = await this.firestore.findUnique('reports', reportId) as any;
        if (!report) throw new Error('Report not found');

        await this.firestore.update('reports', reportId, {
            status: ReportStatus.APPROVED,
            reviewedBy: adminId,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            actionTaken: action,
        });

        if (action === 'BAN_USER' && report.reportedUserId) {
            await this.firestore.update('users', report.reportedUserId, { isBanned: true });
        } else if (action === 'DELETE_MESSAGE' && report.conversationId && report.messageId) {
            await this.firestore.update(`conversations/${report.conversationId}/messages`, report.messageId, { isDeleted: true });
        }
    }

    async rejectReport(reportId: string, adminId: string) {
        await this.firestore.update('reports', reportId, {
            status: ReportStatus.REJECTED,
            reviewedBy: adminId,
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    async getReportStats() {
        const [total, pending, underReview, approved, rejected] = await Promise.all([
            this.firestore.count('reports'),
            this.firestore.count('reports', (ref) => ref.where('status', '==', ReportStatus.PENDING)),
            this.firestore.count('reports', (ref) => ref.where('status', '==', ReportStatus.UNDER_REVIEW)),
            this.firestore.count('reports', (ref) => ref.where('status', '==', ReportStatus.APPROVED)),
            this.firestore.count('reports', (ref) => ref.where('status', '==', ReportStatus.REJECTED)),
        ]);

        return { total, pending, underReview, approved, rejected };
    }
}
