"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get AuthThrottlerGuard () {
        return AuthThrottlerGuard;
    },
    get LoginRateLimitGuard () {
        return LoginRateLimitGuard;
    },
    get PasswordResetRateLimitGuard () {
        return PasswordResetRateLimitGuard;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AuthThrottlerGuard = class AuthThrottlerGuard extends _throttler.ThrottlerGuard {
    async getTracker(req) {
        // Track by both IP and email for login attempts
        const email = req.body?.email || '';
        const ip = req.ip || req.connection.remoteAddress;
        // Combine IP + email for tracking (prevents distributed attacks on same account)
        return `${ip}:${email}`;
    }
};
AuthThrottlerGuard = _ts_decorate([
    (0, _common.Injectable)()
], AuthThrottlerGuard);
let LoginRateLimitGuard = class LoginRateLimitGuard {
    async canActivate(context) {
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
            resetAt: now + 15 * 60 * 1000
        };
        // Block if exceeded limit
        if (current.count >= 5) {
            console.warn('[AUTH] Login rate limit exceeded:', {
                email,
                ip
            });
            throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }
        // Increment counter
        current.count++;
        this.loginAttempts.set(key, current);
        return true;
    }
    constructor(){
        this.loginAttempts = new Map();
    }
};
LoginRateLimitGuard = _ts_decorate([
    (0, _common.Injectable)()
], LoginRateLimitGuard);
let PasswordResetRateLimitGuard = class PasswordResetRateLimitGuard {
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
            resetAt: now + 60 * 60 * 1000
        };
        if (current.count >= 3) {
            console.warn('[AUTH] Password reset rate limit exceeded:', {
                email
            });
            throw new Error('Too many password reset requests. Please try again in 1 hour.');
        }
        current.count++;
        this.resetAttempts.set(key, current);
        return true;
    }
    constructor(){
        this.resetAttempts = new Map();
    }
};
PasswordResetRateLimitGuard = _ts_decorate([
    (0, _common.Injectable)()
], PasswordResetRateLimitGuard);
