import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionManagementService {
    constructor(private prisma: PrismaService) { }

    /**
     * Invalidate all sessions when password changes
     */
    async invalidateAllSessions(userId: string): Promise<void> {
        // Delete all sessions for this user
        await this.prisma.session.deleteMany({
            where: { userId },
        });

        console.log('[SESSION] Invalidated all sessions for user:', userId);
    }

    /**
     * Change password and invalidate sessions
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<{ success: boolean; message: string }> {
        // Get user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { accounts: true },
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Verify current password
        const passwordAccount = user.accounts.find((a) => a.type === 'credentials');
        if (!passwordAccount) {
            return { success: false, message: 'No password set for this account' };
        }

        const isValid = await bcrypt.compare(
            currentPassword,
            passwordAccount.password || '',
        );

        if (!isValid) {
            return { success: false, message: 'Current password is incorrect' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.prisma.account.update({
            where: { id: passwordAccount.id },
            data: { password: hashedPassword },
        });

        // Invalidate all sessions
        await this.invalidateAllSessions(userId);

        console.log('[SESSION] Password changed and sessions invalidated:', userId);

        return {
            success: true,
            message:
                'Password changed successfully. Please log in again on all devices.',
        };
    }

    /**
     * Logout from all devices
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
            expiresAt: session.expiresAt,
        }));
    }
}
