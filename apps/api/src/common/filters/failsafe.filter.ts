import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class FailsafeFilter implements ExceptionFilter {
    private readonly logger = new Logger(FailsafeFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // 1. LOG THE REAL ERROR (Critical for debugging)
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : exception;

        this.logger.error(
            `[CRITICAL FAILSAFE CAUGHT ERROR] Path: ${request.url}`,
            exception instanceof Error ? exception.stack : JSON.stringify(exception)
        );

        // 2. CHECK IF IT'S A CHAT ROUTE
        // We only want to mask errors for the end-user on chat routes to prevent "Red screen of death"
        if (request.url.includes('/chat/send') || request.url.includes('/public-chat')) {
            // 3. RETURN FRIENDLY FAILSAFE RESPONSE
            // This matches the structure expected by ChatUI.tsx
            return response.status(200).json({
                userMessage: {
                    id: Date.now().toString(),
                    content: request.body.message || "...",
                    createdAt: new Date(),
                    sender: 'USER'
                },
                aiMessage: {
                    id: (Date.now() + 1).toString(),
                    content: "[BACKEND_FAILSAFE] Hmm, my connections are fuzzy right now 🌫️ let's try that again?",
                    createdAt: new Date(),
                    sender: 'CREATOR'
                },
                tokensUsed: 0,
                model: 'failsafe',
                remainingMessages: 5,
                debugError: process.env.NODE_ENV === 'development' ? JSON.stringify(errorResponse) : undefined
            });
        }

        // For non-chat routes, return normal error behavior (or global error page equivalent)
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Internal Server Error (Check logs)',
        });
    }
}
