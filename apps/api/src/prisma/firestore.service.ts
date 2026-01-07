import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService implements OnModuleInit {
    private db: admin.firestore.Firestore;

    onModuleInit() {
        if (!admin.apps.length) {
            admin.initializeApp();
        }
        this.db = admin.firestore();
    }

    getFirestore() {
        return this.db;
    }

    collection(name: string) {
        return this.db.collection(name);
    }

    async findUnique(collectionPath: string, id: string) {
        const doc = await this.db.collection(collectionPath).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    async findMany(collectionPath: string, queryFn?: (ref: admin.firestore.CollectionReference) => admin.firestore.Query) {
        let query: admin.firestore.Query = this.db.collection(collectionPath);
        if (queryFn) {
            query = queryFn(this.db.collection(collectionPath));
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async create(collectionPath: string, data: any, id?: string) {
        if (id) {
            await this.db.collection(collectionPath).doc(id).set({
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { id, ...data };
        } else {
            const docRef = await this.db.collection(collectionPath).add({
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { id: docRef.id, ...data };
        }
    }

    async update(collectionPath: string, id: string, data: any, upsert: boolean = false) {
        if (upsert) {
            await this.db.collection(collectionPath).doc(id).set({
                ...data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        } else {
            await this.db.collection(collectionPath).doc(id).update({
                ...data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { id, ...data };
    }

    async delete(collectionPath: string, id: string) {
        await this.db.collection(collectionPath).doc(id).delete();
    }

    async count(collectionPath: string, queryFn?: (ref: admin.firestore.CollectionReference) => admin.firestore.Query) {
        let query: admin.firestore.Query = this.db.collection(collectionPath);
        if (queryFn) {
            query = queryFn(this.db.collection(collectionPath));
        }
        const snapshot = await query.count().get();
        return snapshot.data().count;
    }

    async runTransaction<T>(updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>): Promise<T> {
        return this.db.runTransaction(updateFunction);
    }
}
