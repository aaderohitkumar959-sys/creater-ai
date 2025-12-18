import { PrismaService } from '../prisma/prisma.service';
export declare class CoinService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateWallet(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        balance: number;
    }>;
    getBalance(userId: string): Promise<number>;
    addCoins(userId: string, amount: number, description: string, metadata?: any): Promise<number>;
    deductCoins(userId: string, amount: number, description: string, metadata?: any): Promise<boolean>;
    addCreatorEarnings(creatorUserId: string, amount: number, metadata?: any): Promise<number>;
    getTransactionHistory(userId: string, limit?: number): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: number;
        walletId: string;
    }[]>;
    canEarnAdReward(userId: string): Promise<boolean>;
    getAdsWatchedToday(userId: string): Promise<number>;
    grantAdReward(userId: string, amount: number): Promise<number>;
    verifyWalletIntegrity(userId: string): Promise<{
        isValid: boolean;
        walletBalance: number;
        transactionSum: number;
        difference: number;
    }>;
}
