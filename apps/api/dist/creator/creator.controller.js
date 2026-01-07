"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreatorController", {
    enumerable: true,
    get: function() {
        return CreatorController;
    }
});
const _common = require("@nestjs/common");
const _creatorservice = require("./creator.service");
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
let CreatorController = class CreatorController {
    async createProfile(req, body) {
        return this.creatorService.createCreatorProfile(req.user.id, body.bio);
    }
    async createPersona(req, body) {
        // First get creator ID
        const creator = await this.creatorService.getCreatorProfile(req.user.id);
        if (!creator) {
            throw new Error('Creator profile not found');
        }
        return this.creatorService.createPersona(creator.id, body);
    }
    async addTrainingData(body) {
        return this.creatorService.addTrainingData(body.personaId, body.content);
    }
    async getDashboard(req) {
        return this.creatorService.getDashboardStats(req.user.id);
    }
    constructor(creatorService){
        this.creatorService = creatorService;
    }
};
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)('profile'),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CreatorController.prototype, "createProfile", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)('persona'),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CreatorController.prototype, "createPersona", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)('training-data'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CreatorController.prototype, "addTrainingData", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Get)('dashboard'),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], CreatorController.prototype, "getDashboard", null);
CreatorController = _ts_decorate([
    (0, _common.Controller)('creator'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _creatorservice.CreatorService === "undefined" ? Object : _creatorservice.CreatorService
    ])
], CreatorController);
