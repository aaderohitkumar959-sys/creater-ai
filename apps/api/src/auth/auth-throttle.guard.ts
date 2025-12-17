import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom rate limiting guard for authentication endpoints
 * Stricter limits to prevent brute-force attacks
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Track by both IP and email for login attempts
        const email = req.body?.email || '';
        const ip = req.ip || req.connection.remoteAddress;

        // Combine IP + email for tracking (prevents distributed attacks on same account)
        return `${ip}:${email}`;
    }
}

/**
 * Login rate limiter: 5 attempts per 15 minutes
 * Applied to /auth/login endpoint
 */
@Injectable()
export class LoginRateLimitGuard implements CanActivate {
    private loginAttempts = new Map<string, { count: number; resetAt: number }>();

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const email = request.body?.email || '';
        const ip = request.ip || request.connection.remoteAddress;
        const key = `${ip}:${email}`;

        const now = Date.now();
        const attempt = this.loginAttempts.get(key);

        // Reset if window expired (15 minutes)
        if (attempt && now > attempt.resetAt) {
            this.loginAttempts.delete(key);
        }

        const current = this.loginAttempts.get(key) || {
            count: 0,
            resetAt: now + 15 * 60 * 1000, // 15 minutes
        };

        // Block if exceeded limit
        if (current.count >= 5) {
            console.warn('[AUTH] Login rate limit exceeded:', { email, ip });
            throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }

        // Increment counter
        current.count++;
        this.loginAttempts.set(key, current);

        return true;
    }
}

/**
 * Password reset rate limiter: 3 attempts per hour
 */
@Injectable()
export class PasswordResetRateLimitGuard implements CanActivate {
    private resetAttempts = new Map<string, { count: number; resetAt: number }>();

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const email = request.body?.email || '';
        const key = `reset:${email}`;

        const now = Date.now();
        const attempt = this.resetAttempts.get(key);

        if (attempt && now > attempt.resetAt) {
            this.resetAttempts.delete(key);
        }

        const current = this.resetAttempts.get(key) || {
            count: 0,
            resetAt: now + 60 * 60 * 1000, // 1 hour
        };

        if (current.count >= 3) {
            console.warn('[AUTH] Password reset rate limit exceeded:', { email });
            throw new Error('Too many password reset requests. Please try again in 1 hour.');
        }

        current.count++;
        this.resetAttempts.set(key, current);

        return true;
    }
}
