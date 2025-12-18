import { PrismaService } from '../prisma/prisma.service';
export declare class SessionManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    invalidateAllSessions(userId: string): Promise<void>;
    logoutAllDevices(userId: string): Promise<void>;
    getActiveSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
    }[]>;
}
