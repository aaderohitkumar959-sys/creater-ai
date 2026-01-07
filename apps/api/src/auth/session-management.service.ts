import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';

@Injectable()
export class SessionManagementService {
    constructor(private firestore: FirestoreService) { }

    async invalidateAllSessions(userId: string): Promise<void> {
        // In Firebase, we revoke refresh tokens to sign out from all devices
        await admin.auth().revokeRefreshTokens(userId);

        // Also clear any custom session tracking docs
        const sessions = await this.firestore.findMany('sessions', (ref) => ref.where('userId', '==', userId)) as any[];
        await Promise.all(sessions.map(s => this.firestore.delete('sessions', s.id)));
    }

    async logoutAllDevices(userId: string): Promise<void> {
        await this.invalidateAllSessions(userId);
    }

    async getActiveSessions(userId: string) {
        // Fetch custom session tracking docs if they exist
        const sessions = await this.firestore.findMany('sessions', (ref) =>
            ref.where('userId', '==', userId).orderBy('createdAt', 'desc')
        ) as any[];

        return sessions.map((session) => ({
            id: session.id,
            createdAt: session.createdAt?.toDate ? session.createdAt.toDate() : session.createdAt,
            expiresAt: session.expires?.toDate ? session.expires.toDate() : session.expires,
        }));
    }
}
