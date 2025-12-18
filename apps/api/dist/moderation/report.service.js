"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = exports.ReportStatus = exports.ReportReason = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var ReportReason;
(function (ReportReason) {
    ReportReason["HARASSMENT"] = "HARASSMENT";
    ReportReason["SPAM"] = "SPAM";
    ReportReason["INAPPROPRIATE"] = "INAPPROPRIATE";
    ReportReason["ILLEGAL"] = "ILLEGAL";
    ReportReason["OTHER"] = "OTHER";
})(ReportReason || (exports.ReportReason = ReportReason = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ReportStatus["APPROVED"] = "APPROVED";
    ReportStatus["REJECTED"] = "REJECTED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
let ReportService = class ReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitReport(reporterId, data) {
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
        if (data.reportedUserId) {
            const reportCount = await this.prisma.report.count({
                where: {
                    reportedUserId: data.reportedUserId,
                    status: ReportStatus.PENDING,
                },
            });
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
    async getPendingReports(limit = 50) {
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
                reported: {
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
    async approveReport(reportId, adminId, action) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new Error('Report not found');
        }
        await this.prisma.report.update({
            where: { id: reportId },
            data: {
                status: ReportStatus.APPROVED,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                actionTaken: action,
            },
        });
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
    async rejectReport(reportId, adminId) {
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
    async banUser(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true },
        });
        console.log('[REPORT] User banned:', userId);
    }
    async deleteMessage(messageId) {
        await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true },
        });
        console.log('[REPORT] Message deleted:', messageId);
    }
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
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportService);
//# sourceMappingURL=report.service.js.map