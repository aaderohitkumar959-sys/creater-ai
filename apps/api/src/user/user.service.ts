import { Injectable, NotFoundException } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
    constructor(private firestore: FirestoreService) { }

    /**
     * GDPR: Request user data deletion
     * Creates a deletion request with 30-day grace period
     */
    async requestDeletion(userId: string): Promise<{
        success: boolean;
        token: string;
        expiresAt: Date;
    }> {
        const user = await this.firestore.findUnique('users', userId) as any;

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await this.firestore.update('users', userId, {
            'metadata.deletionRequested': true,
            'metadata.deletionToken': token,
            'metadata.deletionExpiresAt': expiresAt.toISOString(),
        });

        console.log('[GDPR] Deletion requested:', { userId, expiresAt });

        return { success: true, token, expiresAt };
    }

    /**
     * GDPR: Confirm and execute user data deletion
     */
    async confirmDeletion(token: string): Promise<boolean> {
        const users = await this.firestore.findMany('users', (ref) =>
            ref.where('metadata.deletionToken', '==', token)
        );

        if (users.length === 0) {
            throw new Error('Invalid deletion token');
        }

        const user = users[0] as any;
        const metadata = user.metadata;
        const expiresAt = new Date(metadata.deletionExpiresAt);

        if (expiresAt < new Date()) {
            throw new Error('Deletion token expired');
        }

        console.log('[GDPR] Executing deletion for user:', user.id);

        await this.firestore.runTransaction(async (transaction) => {
            const userId = user.id;

            // 1. Delete user doc
            transaction.delete(this.firestore.collection('users').doc(userId));

            // 2. Delete conversations (note: this only deletes the top level, sub-collections need special handling if not using recursive delete)
            const convSnapshot = await this.firestore.collection('conversations')
                .where('userId', '==', userId)
                .get();

            convSnapshot.forEach(doc => {
                transaction.delete(doc.ref);
            });

            // 3. Delete usage tracking
            transaction.delete(this.firestore.collection('usage_tracking').doc(userId));
        });

        console.log('[GDPR] User data deleted successfully:', user.id);
        return true;
    }

    /**
     * GDPR: Export all user data
     */
    async exportData(userId: string): Promise<any> {
        const user = await this.firestore.findUnique('users', userId) as any;

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const conversations = await this.firestore.findMany('conversations', (ref) =>
            ref.where('userId', '==', userId)
        );

        const exportData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            conversations: conversations.map((conv: any) => ({
                personaId: conv.personaId,
                createdAt: conv.createdAt,
            })),
            exportDate: new Date().toISOString(),
        };

        console.log('[GDPR] Data exported for user:', userId);
        return exportData;
    }

    /**
     * Cancel deletion request
     */
    async cancelDeletion(userId: string): Promise<boolean> {
        await this.firestore.update('users', userId, {
            'metadata.deletionRequested': false,
            'metadata.deletionToken': null,
            'metadata.deletionExpiresAt': null,
        });

        console.log('[GDPR] Deletion cancelled for user:', userId);
        return true;
    }

    async getUserProfile(userId: string) {
        const user = await this.firestore.findUnique('users', userId) as any;

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            coinBalance: user.coinBalance || 0,
        };
    }
}
