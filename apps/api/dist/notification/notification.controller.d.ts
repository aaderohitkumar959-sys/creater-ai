import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    subscribe(req: any, subscription: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        auth: string;
        userId: string;
        endpoint: string;
        p256dh: string;
    }>;
    testNotification(req: any): Promise<void>;
}
