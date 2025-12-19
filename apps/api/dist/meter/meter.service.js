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
exports.MeteredService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MeteredService = class MeteredService {
    prisma;
    DAILY_LIMIT = 40;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                dailyMessageCount: true,
                lastMessageDate: true,
                role: true,
                subscription: true,
            },
        });
        if (!user)
            return { allowed: false, remaining: 0 };
        if (user.subscription?.status === 'ACTIVE' || user.role === 'ADMIN') {
            return { allowed: true, remaining: -1 };
        }
        const today = new Date();
        const lastDate = user.lastMessageDate ? new Date(user.lastMessageDate) : new Date(0);
        const isSameDay = today.getDate() === lastDate.getDate() &&
            today.getMonth() === lastDate.getMonth() &&
            today.getFullYear() === lastDate.getFullYear();
        if (!isSameDay) {
            return { allowed: true, remaining: this.DAILY_LIMIT };
        }
        const remaining = Math.max(0, this.DAILY_LIMIT - user.dailyMessageCount);
        return { allowed: remaining > 0, remaining };
    }
    async incrementUsage(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { dailyMessageCount: true, lastMessageDate: true },
        });
        if (!user)
            return;
        const today = new Date();
        const lastDate = user.lastMessageDate ? new Date(user.lastMessageDate) : new Date(0);
        const isSameDay = today.getDate() === lastDate.getDate() &&
            today.getMonth() === lastDate.getMonth() &&
            today.getFullYear() === lastDate.getFullYear();
        if (!isSameDay) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: 1,
                    lastMessageDate: today,
                },
            });
        }
        else {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: { increment: 1 },
                    lastMessageDate: today,
                },
            });
        }
    }
    async getRemainingMessages(userId) {
        const { remaining } = await this.checkLimit(userId);
        return remaining;
    }
};
exports.MeteredService = MeteredService;
exports.MeteredService = MeteredService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeteredService);
