import { PrismaService } from '../prisma/prisma.service';
export declare class MeteredService {
    private prisma;
    private readonly DAILY_LIMIT;
    constructor(prisma: PrismaService);
    checkLimit(userId: string): Promise<{
        allowed: boolean;
        remaining: number;
    }>;
    incrementUsage(userId: string): Promise<void>;
    getRemainingMessages(userId: string): Promise<number>;
}
