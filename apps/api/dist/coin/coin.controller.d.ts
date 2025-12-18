import { CoinService } from './coin.service';
export declare class CoinController {
    private readonly coinService;
    constructor(coinService: CoinService);
    getBalance(userId: string): Promise<{
        balance: number;
    }>;
    getTransactions(userId: string): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: number;
        walletId: string;
    }[]>;
    spendCoins(body: {
        userId: string;
        amount: number;
        description: string;
    }): Promise<boolean>;
}
