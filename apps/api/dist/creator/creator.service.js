"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreatorService", {
    enumerable: true,
    get: function() {
        return CreatorService;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
const _config = require("@nestjs/config");
const _crypto = require("crypto");
const _util = require("util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreatorService = class CreatorService {
    async encrypt(text) {
        const password = this.config.get('ENCRYPTION_KEY') || 'default-secret-key';
        const iv = (0, _crypto.randomBytes)(16);
        const key = await (0, _util.promisify)(_crypto.scrypt)(password, 'salt', 32);
        const cipher = (0, _crypto.createCipheriv)('aes-256-ctr', key, iv);
        const encryptedText = Buffer.concat([
            cipher.update(text),
            cipher.final()
        ]);
        return iv.toString('hex') + ':' + encryptedText.toString('hex');
    }
    async createCreatorProfile(userId, bio) {
        return this.firestore.create('creators', {
            bio,
            userId,
            earnings: 0
        }, userId);
    }
    async createPersona(creatorId, data) {
        return this.firestore.create('personas', {
            creatorId,
            ...data,
            trainingData: []
        });
    }
    async addTrainingData(personaId, content, type = 'TEXT') {
        const encryptedContent = await this.encrypt(content);
        const persona = await this.firestore.findUnique('personas', personaId);
        if (!persona) throw new Error('Persona not found');
        const trainingData = persona.trainingData || [];
        trainingData.push({
            content: encryptedContent,
            type,
            createdAt: new Date()
        });
        return this.firestore.update('personas', personaId, {
            trainingData
        });
    }
    async getCreatorProfile(userId) {
        const creator = await this.firestore.findUnique('creators', userId);
        if (!creator) return null;
        const personas = await this.firestore.findMany('personas', (ref)=>ref.where('creatorId', '==', creator.id));
        return {
            ...creator,
            personas
        };
    }
    async getPersonaById(personaId) {
        const persona = await this.firestore.findUnique('personas', personaId);
        if (!persona) return null;
        const creator = await this.firestore.findUnique('creators', persona.creatorId);
        return {
            ...persona,
            creator
        };
    }
    async updatePersona(personaId, data) {
        return this.firestore.update('personas', personaId, data);
    }
    async getDashboardStats(userId) {
        const creator = await this.firestore.findUnique('creators', userId);
        if (!creator) return null;
        const personas = await this.firestore.findMany('personas', (ref)=>ref.where('creatorId', '==', creator.id));
        const personasWithStats = await Promise.all(personas.map(async (p)=>{
            const conversationsCount = await this.firestore.count('conversations', (ref)=>ref.where('personaId', '==', p.id));
            return {
                ...p,
                conversationCount: conversationsCount
            };
        }));
        return {
            earnings: creator.earnings || 0,
            personas: personasWithStats,
            totalPersonas: personas.length
        };
    }
    constructor(firestore, config){
        this.firestore = firestore;
        this.config = config;
    }
};
CreatorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], CreatorService);
