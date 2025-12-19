"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PersonaController = class PersonaController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllPersonas(search, category) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category && category !== 'All') {
            where.category = category;
        }
        return this.prisma.persona.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        bio: true,
                        user: { select: { name: true, image: true } },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getFeaturedPersonas() {
        return this.prisma.persona.findMany({
            where: {
                isFeatured: true,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        bio: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getPersona(id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(id);
        if (isUuid) {
            return this.prisma.persona.findUnique({
                where: { id },
                include: { creator: true },
            });
        }
        const slugifiedId = id.replace(/-/g, ' ');
        return this.prisma.persona.findFirst({
            where: {
                name: {
                    contains: slugifiedId,
                    mode: 'insensitive',
                },
            },
            include: { creator: true },
        });
    }
    async updatePersona(id, data) {
        return this.prisma.persona.update({
            where: { id },
            data,
        });
    }
};
exports.PersonaController = PersonaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PersonaController.prototype, "getAllPersonas", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PersonaController.prototype, "getFeaturedPersonas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PersonaController.prototype, "getPersona", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonaController.prototype, "updatePersona", null);
exports.PersonaController = PersonaController = __decorate([
    (0, common_1.Controller)('personas'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonaController);
