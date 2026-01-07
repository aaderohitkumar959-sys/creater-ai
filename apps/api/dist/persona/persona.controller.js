"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PersonaController", {
    enumerable: true,
    get: function() {
        return PersonaController;
    }
});
const _common = require("@nestjs/common");
const _firestoreservice = require("../prisma/firestore.service");
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
let PersonaController = class PersonaController {
    async getAllPersonas(search, category) {
        return this.firestore.findMany('personas', (ref)=>{
            let query = ref;
            if (category && category !== 'All') {
                query = query.where('category', '==', category);
            }
            return query.orderBy('createdAt', 'desc');
        });
    }
    async getFeaturedPersonas() {
        return this.firestore.findMany('personas', (ref)=>{
            return ref.where('isFeatured', '==', true).orderBy('createdAt', 'desc');
        });
    }
    async getPersona(id) {
        return this.firestore.findUnique('personas', id);
    }
    async updatePersona(id, data) {
        return this.firestore.update('personas', id, data);
    }
    constructor(firestore){
        this.firestore = firestore;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('search')),
    _ts_param(1, (0, _common.Query)('category')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PersonaController.prototype, "getAllPersonas", null);
_ts_decorate([
    (0, _common.Get)('featured'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PersonaController.prototype, "getFeaturedPersonas", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PersonaController.prototype, "getPersona", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PersonaController.prototype, "updatePersona", null);
PersonaController = _ts_decorate([
    (0, _common.Controller)('personas'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _firestoreservice.FirestoreService === "undefined" ? Object : _firestoreservice.FirestoreService
    ])
], PersonaController);
