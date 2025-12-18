"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetRateLimitGuard = exports.LoginRateLimitGuard = exports.AuthThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let AuthThrottlerGuard = class AuthThrottlerGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        const email = req.body?.email || '';
        const ip = req.ip || req.connection.remoteAddress;
        return `${ip}:${email}`;
    }
};
exports.AuthThrottlerGuard = AuthThrottlerGuard;
exports.AuthThrottlerGuard = AuthThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], AuthThrottlerGuard);
let LoginRateLimitGuard = class LoginRateLimitGuard {
    loginAttempts = new Map();
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const email = request.body?.email || '';
        const ip = request.ip || request.connection.remoteAddress;
        const key = `${ip}:${email}`;
        const now = Date.now();
        const attempt = this.loginAttempts.get(key);
        if (attempt && now > attempt.resetAt) {
            this.loginAttempts.delete(key);
        }
        const current = this.loginAttempts.get(key) || {
            count: 0,
            resetAt: now + 15 * 60 * 1000,
        };
        if (current.count >= 5) {
            console.warn('[AUTH] Login rate limit exceeded:', { email, ip });
            throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }
        current.count++;
        this.loginAttempts.set(key, current);
        return true;
    }
};
exports.LoginRateLimitGuard = LoginRateLimitGuard;
exports.LoginRateLimitGuard = LoginRateLimitGuard = __decorate([
    (0, common_1.Injectable)()
], LoginRateLimitGuard);
let PasswordResetRateLimitGuard = class PasswordResetRateLimitGuard {
    resetAttempts = new Map();
    async canActivate(context) {
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
            resetAt: now + 60 * 60 * 1000,
        };
        if (current.count >= 3) {
            console.warn('[AUTH] Password reset rate limit exceeded:', { email });
            throw new Error('Too many password reset requests. Please try again in 1 hour.');
        }
        current.count++;
        this.resetAttempts.set(key, current);
        return true;
    }
};
exports.PasswordResetRateLimitGuard = PasswordResetRateLimitGuard;
exports.PasswordResetRateLimitGuard = PasswordResetRateLimitGuard = __decorate([
    (0, common_1.Injectable)()
], PasswordResetRateLimitGuard);
//# sourceMappingURL=auth-throttle.guard.js.map