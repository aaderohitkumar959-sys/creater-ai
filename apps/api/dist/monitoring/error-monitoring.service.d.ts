import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ErrorMonitoringService implements OnModuleInit {
    private config;
    constructor(config: ConfigService);
    onModuleInit(): void;
    captureException(error: Error, context?: Record<string, any>): void;
    captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
    setUser(userId: string, email?: string): void;
    clearUser(): void;
    addBreadcrumb(message: string, category: string, data?: Record<string, any>): void;
}
