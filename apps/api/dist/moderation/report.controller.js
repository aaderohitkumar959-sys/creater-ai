"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReportController", {
    enumerable: true,
    get: function() {
        return ReportController;
    }
});
const _common = require("@nestjs/common");
const _reportservice = require("./report.service");
const _jwtauthguard = require("../auth/jwt-auth.guard");
const _adminguard = require("../auth/admin.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let ReportController = class ReportController {
    /**
     * Submit a report
     */ async submitReport(req, body) {
        const reporterId = req.user.id;
        const report = await this.reportService.submitReport(reporterId, body);
        return {
            message: 'Report submitted successfully. We will review it shortly.',
            reportId: report.id
        };
    }
    /**
     * Get pending reports (admin only)
     */ async getPendingReports() {
        return await this.reportService.getPendingReports();
    }
    /**
     * Get report statistics (admin only)
     */ async getReportStats() {
        return await this.reportService.getReportStats();
    }
    /**
     * Approve report (admin only)
     */ async approveReport(reportId, req, body) {
        const adminId = req.user.id;
        await this.reportService.approveReport(reportId, adminId, body.action);
        return {
            message: `Report approved. Action taken: ${body.action}`
        };
    }
    /**
     * Reject report (admin only)
     */ async rejectReport(reportId, req) {
        const adminId = req.user.id;
        await this.reportService.rejectReport(reportId, adminId);
        return {
            message: 'Report rejected'
        };
    }
    constructor(reportService){
        this.reportService = reportService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ReportController.prototype, "submitReport", null);
_ts_decorate([
    (0, _common.Get)('pending'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _adminguard.AdminGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], ReportController.prototype, "getPendingReports", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _adminguard.AdminGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], ReportController.prototype, "getReportStats", null);
_ts_decorate([
    (0, _common.Patch)(':id/approve'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _adminguard.AdminGuard),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ReportController.prototype, "approveReport", null);
_ts_decorate([
    (0, _common.Patch)(':id/reject'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _adminguard.AdminGuard),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ReportController.prototype, "rejectReport", null);
ReportController = _ts_decorate([
    (0, _common.Controller)('reports'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _reportservice.ReportService === "undefined" ? Object : _reportservice.ReportService
    ])
], ReportController);
