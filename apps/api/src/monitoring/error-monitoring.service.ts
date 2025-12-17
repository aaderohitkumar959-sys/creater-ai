import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ErrorMonitoringService implements OnModuleInit {
    constructor(private config: ConfigService) { }

    onModuleInit() {
        const sentryDsn = this.config.get('SENTRY_DSN');

        if (!sentryDsn) {
            console.warn('[SENTRY] DSN not configured, error monitoring disabled');
            return;
        }

        Sentry.init({
            dsn: sentryDsn,
            environment: this.config.get('NODE_ENV') || 'development',
            tracesSampleRate: 0.1, // Sample 10% of transactions for performance monitoring

            beforeSend(event, hint) {
                // Filter out sensitive data
                if (event.request) {
                    delete event.request.cookies;
                    delete event.request.headers?.['authorization'];
                }
                return event;
            },
        });

        console.log('[SENTRY] Error monitoring initialized');
    }

    /**
     * Capture exception with context
     */
    captureException(error: Error, context?: Record<string, any>) {
        if (context) {
            Sentry.setContext('additional_info', context);
        }
        Sentry.captureException(error);
    }

    /**
     * Capture message (for warnings, info)
     */
    captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
        Sentry.captureMessage(message, level);
    }

    /**
     * Set user context for error tracking
     */
    setUser(userId: string, email?: string) {
        Sentry.setUser({ id: userId, email });
    }

    /**
     * Clear user context (on logout)
     */
    clearUser() {
        Sentry.setUser(null);
    }

    /**
     * Add breadcrumb for debugging
     */
    addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
        Sentry.addBreadcrumb({
            message,
            category,
            data,
            level: 'info',
        });
    }
}
