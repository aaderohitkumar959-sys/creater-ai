import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    subscribe(userId: string, subscription: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        auth: string;
        userId: string;
        endpoint: string;
        p256dh: string;
    }>;
    sendNotification(userId: string, payload: {
        title: string;
        body: string;
        url?: string;
    }): Promise<void>;
}
