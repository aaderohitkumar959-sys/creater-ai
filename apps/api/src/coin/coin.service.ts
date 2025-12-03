import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CoinService {
    async getOrCreateWallet(userId: string) {
        let wallet = await prisma.coinWallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            wallet = await prisma.coinWallet.create({
                data: { userId },
            });
        }

        return wallet;
    }

    async getBalance(userId: string): Promise<number> {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.balance;
    }

    async addCoins(userId: string, amount: number, description: string, metadata?: any) {
        const wallet = await this.getOrCreateWallet(userId);

        await prisma.coinTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'PURCHASE',
                amount,
                description,
                metadata,
            },
        });

        await prisma.coinWallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: amount } },
        });

        return this.getBalance(userId);
    }

    async deductCoins(userId: string, amount: number, description: string, metadata?: any): Promise<boolean> {
        const wallet = await this.getOrCreateWallet(userId);

        if (wallet.balance < amount) {
            return false; // Insufficient balance
        }

        await prisma.coinTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'SPEND',
                amount: -amount,
                description,
                metadata,
            },
        });

        await prisma.coinWallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: amount } },
        });

        return true;
    }

    async addCreatorEarnings(creatorUserId: string, amount: number, metadata?: any) {
        const platformFee = Math.floor(amount * 0.3); // 30% platform fee
        const creatorEarnings = amount - platformFee;

        const wallet = await this.getOrCreateWallet(creatorUserId);

        await prisma.coinTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'EARN',
                amount: creatorEarnings,
                description: 'Creator earnings from message',
                metadata: { ...metadata, platformFee, grossAmount: amount },
            },
        });

        await prisma.coinWallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: creatorEarnings } },
        });

        return creatorEarnings;
    }

    async getTransactionHistory(userId: string, limit = 20) {
        const wallet = await this.getOrCreateWallet(userId);

        return prisma.coinTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async canEarnAdReward(userId: string): Promise<boolean> {
        const adsWatched = await this.getAdsWatchedToday(userId);
        return adsWatched < 5; // Max 5 ads per day
    }

    async getAdsWatchedToday(userId: string): Promise<number> {
        const wallet = await this.getOrCreateWallet(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.coinTransaction.count({
            where: {
                walletId: wallet.id,
                type: 'EARN',
                description: { contains: 'ad reward' },
                createdAt: { gte: today },
            },
        });

        return count;
    }

    async grantAdReward(userId: string, amount: number): Promise<number> {
        const canEarn = await this.canEarnAdReward(userId);
        if (!canEarn) {
            throw new Error('Daily ad limit reached');
        }

        const wallet = await this.getOrCreateWallet(userId);

        await prisma.coinTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'EARN',
                amount,
                description: 'Earned from ad reward',
                metadata: { source: 'advertisement', timestamp: new Date() },
            },
        });

        await prisma.coinWallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: amount } },
        });

        return this.getBalance(userId);
    }
}
