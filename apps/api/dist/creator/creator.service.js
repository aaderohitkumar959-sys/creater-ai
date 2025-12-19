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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const util_1 = require("util");
let CreatorService = class CreatorService {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async encrypt(text) {
        const password = this.config.get('ENCRYPTION_KEY') || 'default-secret-key';
        const iv = (0, crypto_1.randomBytes)(16);
        const key = (await (0, util_1.promisify)(crypto_1.scrypt)(password, 'salt', 32));
        const cipher = (0, crypto_1.createCipheriv)('aes-256-ctr', key, iv);
        const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
        return iv.toString('hex') + ':' + encryptedText.toString('hex');
    }
    async createCreatorProfile(userId, bio) {
        return this.prisma.creator.create({
            data: {
                userId,
                bio,
            },
        });
    }
    async createPersona(creatorId, data) {
        return this.prisma.persona.create({
            data: {
                creatorId,
                ...data,
            },
        });
    }
    async addTrainingData(personaId, content, type = 'TEXT') {
        const encryptedContent = await this.encrypt(content);
        return this.prisma.trainingData.create({
            data: {
                personaId,
                content: encryptedContent,
                type,
            },
        });
    }
    async getCreatorProfile(userId) {
        return this.prisma.creator.findUnique({
            where: { userId },
            include: { personas: true },
        });
    }
    async getPersonaById(personaId) {
        return this.prisma.persona.findUnique({
            where: { id: personaId },
            include: {
                trainingData: true,
                creator: true,
            },
        });
    }
    async updatePersona(personaId, data) {
        return this.prisma.persona.update({
            where: { id: personaId },
            data,
        });
    }
    async getDashboardStats(userId) {
        const creator = await this.prisma.creator.findUnique({
            where: { userId },
            include: {
                personas: {
                    include: {
                        _count: {
                            select: { conversations: true },
                        },
                    },
                },
            },
        });
        if (!creator)
            return null;
        return {
            earnings: creator.earnings,
            personas: creator.personas.map((p) => ({
                ...p,
                conversationCount: p._count.conversations,
            })),
            totalPersonas: creator.personas.length,
        };
    }
};
exports.CreatorService = CreatorService;
exports.CreatorService = CreatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], CreatorService);
