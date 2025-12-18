"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requestDeletion(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const currentMetadata = user.metadata || {};
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    ...currentMetadata,
                    deletionRequested: true,
                    deletionToken: token,
                    deletionExpiresAt: expiresAt.toISOString(),
                },
            },
        });
        console.log('[GDPR] Deletion requested:', {
            userId,
            expiresAt,
        });
        return {
            success: true,
            token,
            expiresAt,
        };
    }
    async confirmDeletion(token) {
        const users = await this.prisma.user.findMany({
            where: { metadata: { not: null } },
        });
        const user = users.find((u) => {
            const meta = u.metadata;
            return meta?.deletionToken === token;
        });
        if (!user) {
            throw new Error('Invalid deletion token');
        }
        const metadata = user.metadata;
        const expiresAt = new Date(metadata.deletionExpiresAt);
        if (expiresAt < new Date()) {
            throw new Error('Deletion token expired');
        }
        console.log('[GDPR] Executing deletion for user:', user.id);
        await this.prisma.$transaction(async (tx) => {
            await tx.message.deleteMany({ where: { userId: user.id } });
            await tx.conversation.deleteMany({ where: { userId: user.id } });
            const wallet = await tx.coinWallet.findUnique({
                where: { userId: user.id },
            });
            if (wallet) {
                await tx.coinTransaction.deleteMany({ where: { walletId: wallet.id } });
                await tx.coinWallet.delete({ where: { id: wallet.id } });
            }
            await tx.payment.deleteMany({ where: { userId: user.id } });
            await tx.session.deleteMany({ where: { userId: user.id } });
            await tx.account.deleteMany({ where: { userId: user.id } });
            await tx.user.delete({ where: { id: user.id } });
            console.log('[GDPR] User data deleted successfully:', user.id);
        });
        return true;
    }
    async exportData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: true,
                sessions: {
                    select: {
                        id: true,
                        sessionToken: true,
                        expires: true,
                        createdAt: true,
                    },
                },
                CoinWallet: {
                    include: {
                        transactions: {
                            orderBy: { createdAt: 'desc' },
                            take: 1000,
                        },
                    },
                },
                Payment: {
                    orderBy: { createdAt: 'desc' },
                },
                conversations: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'asc' },
                        },
                        persona: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const exportData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            accounts: user.accounts.map((acc) => ({
                provider: acc.provider,
                providerAccountId: acc.providerAccountId,
                type: acc.type,
            })),
            coinWallet: user.CoinWallet
                ? {
                    balance: user.CoinWallet.balance,
                    transactions: user.CoinWallet.transactions.map((tx) => ({
                        type: tx.type,
                        amount: tx.amount,
                        description: tx.description,
                        createdAt: tx.createdAt,
                    })),
                }
                : null,
            payments: user.Payment.map((p) => ({
                provider: p.provider,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                coinsGranted: p.coinsGranted,
                createdAt: p.createdAt,
            })),
            conversations: user.conversations.map((conv) => ({
                personaName: conv.persona.name,
                personaDescription: conv.persona.description,
                createdAt: conv.createdAt,
                messages: conv.messages.map((msg) => ({
                    sender: msg.sender,
                    content: msg.content,
                    createdAt: msg.createdAt,
                })),
            })),
            exportDate: new Date().toISOString(),
        };
        console.log('[GDPR] Data exported for user:', userId);
        return exportData;
    }
    async cancelDeletion(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const currentMetadata = user.metadata || {};
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    ...currentMetadata,
                    deletionRequested: false,
                    deletionToken: null,
                    deletionExpiresAt: null,
                },
            },
        });
        console.log('[GDPR] Deletion cancelled for user:', userId);
        return true;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map