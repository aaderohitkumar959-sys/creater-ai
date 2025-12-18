import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    requestDeletion(userId: string): Promise<{
        success: boolean;
        token: string;
        expiresAt: Date;
    }>;
    confirmDeletion(token: string): Promise<boolean>;
    exportData(userId: string): Promise<any>;
    cancelDeletion(userId: string): Promise<boolean>;
}
