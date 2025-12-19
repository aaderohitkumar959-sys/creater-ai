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
exports.SessionManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionManagementService = class SessionManagementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async invalidateAllSessions(userId) {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
        console.log('[SESSION] Invalidated all sessions for user:', userId);
    }
    async logoutAllDevices(userId) {
        await this.invalidateAllSessions(userId);
    }
    async getActiveSessions(userId) {
        const sessions = await this.prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return sessions.map((session) => ({
            id: session.id,
            createdAt: session.createdAt,
            expiresAt: session.expires,
        }));
    }
};
exports.SessionManagementService = SessionManagementService;
exports.SessionManagementService = SessionManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionManagementService);
