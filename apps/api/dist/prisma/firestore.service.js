"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FirestoreService", {
    enumerable: true,
    get: function() {
        return FirestoreService;
    }
});
const _common = require("@nestjs/common");
const _firebaseadmin = /*#__PURE__*/ _interop_require_wildcard(require("firebase-admin"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let FirestoreService = class FirestoreService {
    onModuleInit() {
        if (!_firebaseadmin.apps.length) {
            _firebaseadmin.initializeApp();
        }
        this.db = _firebaseadmin.firestore();
    }
    getFirestore() {
        return this.db;
    }
    collection(name) {
        return this.db.collection(name);
    }
    async findUnique(collectionPath, id) {
        const doc = await this.db.collection(collectionPath).doc(id).get();
        return doc.exists ? {
            id: doc.id,
            ...doc.data()
        } : null;
    }
    async findMany(collectionPath, queryFn) {
        let query = this.db.collection(collectionPath);
        if (queryFn) {
            query = queryFn(this.db.collection(collectionPath));
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...doc.data()
            }));
    }
    async create(collectionPath, data, id) {
        if (id) {
            await this.db.collection(collectionPath).doc(id).set({
                ...data,
                createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp(),
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
            return {
                id,
                ...data
            };
        } else {
            const docRef = await this.db.collection(collectionPath).add({
                ...data,
                createdAt: _firebaseadmin.firestore.FieldValue.serverTimestamp(),
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
            return {
                id: docRef.id,
                ...data
            };
        }
    }
    async update(collectionPath, id, data, upsert = false) {
        if (upsert) {
            await this.db.collection(collectionPath).doc(id).set({
                ...data,
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            }, {
                merge: true
            });
        } else {
            await this.db.collection(collectionPath).doc(id).update({
                ...data,
                updatedAt: _firebaseadmin.firestore.FieldValue.serverTimestamp()
            });
        }
        return {
            id,
            ...data
        };
    }
    async delete(collectionPath, id) {
        await this.db.collection(collectionPath).doc(id).delete();
    }
    async count(collectionPath, queryFn) {
        let query = this.db.collection(collectionPath);
        if (queryFn) {
            query = queryFn(this.db.collection(collectionPath));
        }
        const snapshot = await query.count().get();
        return snapshot.data().count;
    }
    async runTransaction(updateFunction) {
        return this.db.runTransaction(updateFunction);
    }
};
FirestoreService = _ts_decorate([
    (0, _common.Injectable)()
], FirestoreService);
