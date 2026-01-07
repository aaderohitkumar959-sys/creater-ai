import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirestoreService } from '../prisma/firestore.service';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RedemptionService {
    constructor(private firestore: FirestoreService) { }

    /**
     * Generate a new single-use redemption code
     */
    async generateCode(amount: number = 500): Promise<string> {
        const raw = uuidv4().split('-')[0].toUpperCase();
        const raw2 = uuidv4().split('-')[1].toUpperCase();
        const code = `PAY-${raw}-${raw2}`;

        await this.firestore.create('redemption_codes', {
            code,
            amount,
            isUsed: false,
        });

        return code;
    }

    /**
     * Redeem a code for a user
     */
    async redeemCode(userId: string, code: string) {
        return await this.firestore.runTransaction(async (transaction) => {
            const codeClean = code.trim().toUpperCase();
            const codesRef = this.firestore.collection('redemption_codes');
            const snapshot = await codesRef.where('code', '==', codeClean).limit(1).get();

            if (snapshot.empty) {
                throw new NotFoundException('Invalid redemption code');
            }

            const codeDoc = snapshot.docs[0];
            const codeData = codeDoc.data() as any;

            if (codeData.isUsed) {
                throw new BadRequestException('This code has already been used');
            }

            // 1. Mark code as used
            transaction.update(codeDoc.ref, {
                isUsed: true,
                userId,
                usedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 2. Grant credits to user
            const userRef = this.firestore.collection('users').doc(userId);
            transaction.update(userRef, {
                paidMessageCredits: admin.firestore.FieldValue.increment(codeData.amount),
            });

            return {
                success: true,
                grantedAmount: codeData.amount,
            };
        });
    }
}
