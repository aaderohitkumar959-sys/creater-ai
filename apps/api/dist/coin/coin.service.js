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
exports.CoinService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CoinService = class CoinService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateWallet(userId) {
        let wallet = await this.prisma.coinWallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            wallet = await this.prisma.coinWallet.create({
                data: { userId },
            });
        }
        return wallet;
    }
    async getBalance(userId) {
        const wallet = await this.prisma.coinWallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            return 0;
        }
        return wallet.balance;
    }
    async addCoins(userId, amount, description, metadata) {
        const wallet = await this.getOrCreateWallet(userId);
        return await this.prisma.$transaction(async (tx) => {
            await tx.coinTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'PURCHASE',
                    amount,
                    description,
                    metadata,
                },
            });
            const updatedWallet = await tx.coinWallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } },
            });
            return updatedWallet.balance;
        });
    }
    async deductCoins(userId, amount, description, metadata) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const wallet = await tx.coinWallet.findUnique({
                    where: { userId },
                });
                if (!wallet || wallet.balance < amount) {
                    throw new Error('INSUFFICIENT_BALANCE');
                }
                await tx.coinTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: 'SPEND',
                        amount: -amount,
                        description,
                        metadata,
                    },
                });
                const updated = await tx.coinWallet.updateMany({
                    where: {
                        id: wallet.id,
                        balance: { gte: amount },
                    },
                    data: { balance: { decrement: amount } },
                });
                if (updated.count === 0) {
                    throw new Error('CONCURRENT_MODIFICATION');
                }
            }, {
                isolationLevel: 'Serializable',
            });
            return true;
        }
        catch (error) {
            if (error.message === 'INSUFFICIENT_BALANCE' || error.message === 'CONCURRENT_MODIFICATION') {
                return false;
            }
            throw error;
        }
    }
    async addCreatorEarnings(creatorUserId, amount, metadata) {
        console.warn('[DEPRECATED] addCreatorEarnings should not be used in user-only platform');
        const platformFee = Math.floor(amount * 0.3);
        const creatorEarnings = amount - platformFee;
        const wallet = await this.getOrCreateWallet(creatorUserId);
        await this.prisma.coinTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'EARN',
                amount: creatorEarnings,
                description: 'Creator earnings from message',
                metadata: { ...metadata, platformFee, grossAmount: amount },
            },
        });
        await this.prisma.coinWallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: creatorEarnings } },
        });
        return creatorEarnings;
    }
    async getTransactionHistory(userId, limit = 20) {
        const wallet = await this.getOrCreateWallet(userId);
        return this.prisma.coinTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async canEarnAdReward(userId) {
        const adsWatched = await this.getAdsWatchedToday(userId);
        return adsWatched < 5;
    }
    async getAdsWatchedToday(userId) {
        const wallet = await this.getOrCreateWallet(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = await this.prisma.coinTransaction.count({
            where: {
                walletId: wallet.id,
                type: 'EARN',
                description: { contains: 'ad reward' },
                createdAt: { gte: today },
            },
        });
        return count;
    }
    async grantAdReward(userId, amount) {
        const canEarn = await this.canEarnAdReward(userId);
        if (!canEarn) {
            throw new Error('Daily ad limit reached');
        }
        const wallet = await this.getOrCreateWallet(userId);
        return await this.prisma.$transaction(async (tx) => {
            await tx.coinTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'EARN',
                    amount,
                    description: 'Earned from ad reward',
                    metadata: { source: 'advertisement', timestamp: new Date() },
                },
            });
            const updated = await tx.coinWallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } },
            });
            return updated.balance;
        });
    }
    async verifyWalletIntegrity(userId) {
        const wallet = await this.getOrCreateWallet(userId);
        const transactions = await this.prisma.coinTransaction.findMany({
            where: { walletId: wallet.id },
        });
        const transactionSum = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const difference = wallet.balance - transactionSum;
        return {
            isValid: difference === 0,
            walletBalance: wallet.balance,
            transactionSum,
            difference,
        };
    }
};
exports.CoinService = CoinService;
exports.CoinService = CoinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoinService);
