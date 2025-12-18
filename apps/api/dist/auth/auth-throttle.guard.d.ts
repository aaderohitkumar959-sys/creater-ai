import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
export declare class AuthThrottlerGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string>;
}
export declare class LoginRateLimitGuard implements CanActivate {
    private loginAttempts;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare class PasswordResetRateLimitGuard implements CanActivate {
    private resetAttempts;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
