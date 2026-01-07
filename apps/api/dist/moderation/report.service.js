"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get ReportReason () {
        return ReportReason;
    },
    get ReportService () {
        return ReportService;
    },
    get ReportStatus () {
        return ReportStatus;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var ReportReason = /*#__PURE__*/ function(ReportReason) {
    ReportReason["HARASSMENT"] = "HARASSMENT";
    ReportReason["SPAM"] = "SPAM";
    ReportReason["INAPPROPRIATE"] = "INAPPROPRIATE";
    ReportReason["ILLEGAL"] = "ILLEGAL";
    ReportReason["OTHER"] = "OTHER";
    return ReportReason;
}({});
var ReportStatus = /*#__PURE__*/ function(ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ReportStatus["APPROVED"] = "APPROVED";
    ReportStatus["REJECTED"] = "REJECTED";
    return ReportStatus;
}({});
let ReportService = class ReportService {
    async submitReport(reporterId, data) {
        const reportData = {
            reporterId,
            messageId: data.messageId || null,
            conversationId: data.conversationId || null,
            reportedUserId: data.reportedUserId || null,
            type: data.messageId ? 'MESSAGE' : 'USER',
            category: 'GENERAL',
            reason: data.reason,
            details: data.details || '',
            status: "PENDING",
            createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        };
        const report = await this.firestore.create('reports', reportData);
        if (data.reportedUserId) {
            const reportCount = await this.firestore.count('reports', (ref)=>ref.where('reportedUserId', '==', data.reportedUserId).where('status', '==', "PENDING"));
            if (reportCount >= 3) {
                await this.firestore.update('reports', report.id, {
                    status: "UNDER_REVIEW"
                });
            }
        }
        return report;
    }
    async getPendingReports(limit = 50) {
        const reports = await this.firestore.findMany('reports', (ref)=>ref.where('status', 'in', [
                "PENDING",
                "UNDER_REVIEW"
            ]).orderBy('createdAt', 'desc').limit(limit));
        return Promise.all(reports.map(async (r)=>{
            const [reporter, reported] = await Promise.all([
                this.firestore.findUnique('users', r.reporterId),
                r.reportedUserId ? this.firestore.findUnique('users', r.reportedUserId) : Promise.resolve(null)
            ]);
            let message = null;
            if (r.conversationId && r.messageId) {
                message = await this.firestore.findUnique(`conversations/${r.conversationId}/messages`, r.messageId);
            }
            return {
                ...r,
                reporter,
                reported,
                message
            };
        }));
    }
    async approveReport(reportId, adminId, action) {
        const report = await this.firestore.findUnique('reports', reportId);
        if (!report) throw new Error('Report not found');
        await this.firestore.update('reports', reportId, {
            status: "APPROVED",
            reviewedBy: adminId,
            reviewedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp(),
            actionTaken: action
        });
        if (action === 'BAN_USER' && report.reportedUserId) {
            await this.firestore.update('users', report.reportedUserId, {
                isBanned: true
            });
        } else if (action === 'DELETE_MESSAGE' && report.conversationId && report.messageId) {
            await this.firestore.update(`conversations/${report.conversationId}/messages`, report.messageId, {
                isDeleted: true
            });
        }
    }
    async rejectReport(reportId, adminId) {
        await this.firestore.update('reports', reportId, {
            status: "REJECTED",
            reviewedBy: adminId,
            reviewedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
        });
    }
    async getReportStats() {
        const [total, pending, underReview, approved, rejected] = await Promise.all([
            this.firestore.count('reports'),
            this.firestore.count('reports', (ref)=>ref.where('status', '==', "PENDING")),
            this.firestore.count('reports', (ref)=>ref.where('status', '==', "UNDER_REVIEW")),
            this.firestore.count('reports', (ref)=>ref.where('status', '==', "APPROVED")),
            this.firestore.count('reports', (ref)=>ref.where('status', '==', "REJECTED"))
        ]);
        return {
            total,
            pending,
            underReview,
            approved,
            rejected
        };
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
ReportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], ReportService);
