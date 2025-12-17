import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionManagementService {
    constructor(private prisma: PrismaService) { }

    /**
     * Invalidate all sessions (OAuth sessions)
     */
    async invalidateAllSessions(userId: string): Promise<void> {
        // Delete all sessions for this user
        await this.prisma.session.deleteMany({
            where: { userId },
        });

        console.log('[SESSION] Invalidated all sessions for user:', userId);
    }

    /**
     * Logout from all devices (OAuth sessions)
     */
    async logoutAllDevices(userId: string): Promise<void> {
        await this.invalidateAllSessions(userId);
    }

    /**
     * Get active sessions for user
     */
    async getActiveSessions(userId: string) {
        const sessions = await this.prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return sessions.map((session) => ({
            id: session.id,
            createdAt: session.createdAt,
            expiresAt: session.expires, // Fixed: was expiresAt, but schema has expires
        }));
    }
}
