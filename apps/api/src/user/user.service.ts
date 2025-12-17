import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    /**
     * GDPR: Request user data deletion
     * Creates a deletion request with 30-day grace period
     */
    async requestDeletion(userId: string): Promise<{
        success: boolean;
        token: string;
        expiresAt: Date;
    }> {
        // Fetch user first
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate unique deletion token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day grace period

        // Store deletion request in metadata
        const currentMetadata = (user.metadata as any) || {};
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    ...currentMetadata,
                    deletionRequested: true,
                    deletionToken: token,
                    deletionExpiresAt: expiresAt.toISOString(),
                },
            },
        });

        console.log('[GDPR] Deletion requested:', {
            userId,
            expiresAt,
        });

        // TODO: Send email with confirmation link
        // Email should contain: /user/confirm-deletion/:token

        return {
            success: true,
            token,
            expiresAt,
        };
    }

    /**
     * GDPR: Confirm and execute user data deletion
     * Permanent deletion after confirmation
     */
    async confirmDeletion(token: string): Promise<boolean> {
        // Find all users with metadata and check for token (Json fields need client-side filtering)
        const users = await this.prisma.user.findMany({
            // Fetch users that might have metadata - filter client-side
        });

        // Filter for matching token in metadata
        const user = users.find((u) => {
            const meta = u.metadata as any;
            return meta?.deletionToken === token;
        });

        if (!user) {
            throw new Error('Invalid deletion token');
        }

        const metadata = user.metadata as any;
        const expiresAt = new Date(metadata.deletionExpiresAt);

        if (expiresAt < new Date()) {
            throw new Error('Deletion token expired');
        }

        console.log('[GDPR] Executing deletion for user:', user.id);

        // Delete all user data in correct order (respecting foreign keys)
        await this.prisma.$transaction(async (tx) => {
            // 1. Delete messages
            await tx.message.deleteMany({ where: { userId: user.id } });

            // 2. Delete conversations
            await tx.conversation.deleteMany({ where: { userId: user.id } });

            // 3. Delete coin transactions
            const wallet = await tx.coinWallet.findUnique({
                where: { userId: user.id },
            });
            if (wallet) {
                await tx.coinTransaction.deleteMany({ where: { walletId: wallet.id } });
                await tx.coinWallet.delete({ where: { id: wallet.id } });
            }

            // 4. Delete payments
            await tx.payment.deleteMany({ where: { userId: user.id } });

            // 5. Delete sessions
            await tx.session.deleteMany({ where: { userId: user.id } });

            // 6. Delete accounts (OAuth)
            await tx.account.deleteMany({ where: { userId: user.id } });

            // 7. Delete analytics events
            // await tx.analyticsEvent.deleteMany({ where: { userId: user.id } });

            // 8. Finally, delete user
            await tx.user.delete({ where: { id: user.id } });

            console.log('[GDPR] User data deleted successfully:', user.id);
        });

        return true;
    }

    /**
     * GDPR: Export all user data
     * Returns JSON with all user information
     */
    async exportData(userId: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: true,
                sessions: {
                    select: {
                        id: true,
                        sessionToken: true,
                        expires: true,
                        createdAt: true,
                    },
                },
                CoinWallet: {
                    include: {
                        transactions: {
                            orderBy: { createdAt: 'desc' },
                            take: 1000, // Limit to last 1000 transactions
                        },
                    },
                },
                Payment: {
                    orderBy: { createdAt: 'desc' },
                },
                conversations: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'asc' },
                        },
                        persona: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Sanitize sensitive data
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
            accounts: user.accounts.map((acc) => ({
                provider: acc.provider,
                providerAccountId: acc.providerAccountId,
                type: acc.type,
            })),
            coinWallet: user.CoinWallet
                ? {
                    balance: user.CoinWallet.balance,
                    transactions: user.CoinWallet.transactions.map((tx) => ({
                        type: tx.type,
                        amount: tx.amount,
                        description: tx.description,
                        createdAt: tx.createdAt,
                    })),
                }
                : null,
            payments: user.Payment.map((p) => ({
                provider: p.provider,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                coinsGranted: p.coinsGranted,
                createdAt: p.createdAt,
            })),
            conversations: user.conversations.map((conv) => ({
                personaName: conv.persona.name,
                personaDescription: conv.persona.description,
                createdAt: conv.createdAt,
                messages: conv.messages.map((msg) => ({
                    sender: msg.sender,
                    content: msg.content,
                    createdAt: msg.createdAt,
                })),
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
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const currentMetadata = (user.metadata as any) || {};
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                metadata: {
                    ...currentMetadata,
                    deletionRequested: false,
                    deletionToken: null,
                    deletionExpiresAt: null,
                },
            },
        });

        console.log('[GDPR] Deletion cancelled for user:', userId);
        return true;
    }
}
