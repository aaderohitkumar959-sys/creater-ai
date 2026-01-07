"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserController", {
    enumerable: true,
    get: function() {
        return UserController;
    }
});
const _common = require("@nestjs/common");
const _userservice = require("./user.service");
const _jwtauthguard = require("../auth/jwt-auth.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let UserController = class UserController {
    /**
     * GDPR: Request account deletion
     * Starts 30-day grace period
     */ async requestDeletion(req) {
        const userId = req.user.id;
        const result = await this.userService.requestDeletion(userId);
        return {
            message: 'Deletion requested. You have 30 days to cancel before your account is permanently deleted.',
            expiresAt: result.expiresAt
        };
    }
    /**
     * GDPR: Confirm and execute deletion
     * Permanent - cannot be undone
     */ async confirmDeletion(token) {
        await this.userService.confirmDeletion(token);
        return {
            message: 'Your account and all associated data have been permanently deleted.'
        };
    }
    /**
     * GDPR: Cancel deletion request
     */ async cancelDeletion(req) {
        const userId = req.user.id;
        await this.userService.cancelDeletion(userId);
        return {
            message: 'Deletion request cancelled. Your account is safe.'
        };
    }
    /**
     * GDPR: Export all user data
     */ async exportData(req) {
        const userId = req.user.id;
        const data = await this.userService.exportData(userId);
        return data;
    }
    /**
     * Get user profile
     */ async getProfile(req) {
        const userId = req.user.id; // User object returned by JwtStrategy has 'id'
        return this.userService.getUserProfile(userId);
    }
    constructor(userService){
        this.userService = userService;
    }
};
_ts_decorate([
    (0, _common.Post)('request-deletion'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], UserController.prototype, "requestDeletion", null);
_ts_decorate([
    (0, _common.Delete)('confirm-deletion/:token'),
    _ts_param(0, (0, _common.Param)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UserController.prototype, "confirmDeletion", null);
_ts_decorate([
    (0, _common.Post)('cancel-deletion'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], UserController.prototype, "cancelDeletion", null);
_ts_decorate([
    (0, _common.Get)('export-data'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], UserController.prototype, "exportData", null);
_ts_decorate([
    (0, _common.Get)('profile'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
UserController = _ts_decorate([
    (0, _common.Controller)('user'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _userservice.UserService === "undefined" ? Object : _userservice.UserService
    ])
], UserController);
