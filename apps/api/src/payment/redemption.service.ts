import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RedemptionService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate a new single-use redemption code
     * Typically called after a successful $1.99 payment
     */
    async generateCode(amount: number = 500): Promise<string> {
        // Generate a shorter, user-friendly code but still secure
        // format: PAY-XXXX-XXXX
        const raw = uuidv4().split('-')[0].toUpperCase();
        const raw2 = uuidv4().split('-')[1].toUpperCase();
        const code = `PAY-${raw}-${raw2}`;

        await this.prisma.redemptionCode.create({
            data: {
                code,
                amount,
            },
        });

        return code;
    }

    /**
     * Redeem a code for a user
     */
    async redeemCode(userId: string, code: string) {
        return await this.prisma.$transaction(async (tx) => {
            const redemptionCode = await tx.redemptionCode.findUnique({
                where: { code: code.trim().toUpperCase() },
            });

            if (!redemptionCode) {
                throw new NotFoundException('Invalid redemption code');
            }

            if (redemptionCode.isUsed) {
                throw new BadRequestException('This code has already been used');
            }

            // 1. Mark code as used
            await tx.redemptionCode.update({
                where: { id: redemptionCode.id },
                data: {
                    isUsed: true,
                    userId,
                    usedAt: new Date(),
                },
            });

            // 2. Grant credits to user
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    paidMessageCredits: { increment: redemptionCode.amount },
                },
            });

            return {
                success: true,
                grantedAmount: redemptionCode.amount,
                totalCredits: updatedUser.paidMessageCredits,
            };
        });
    }
}
