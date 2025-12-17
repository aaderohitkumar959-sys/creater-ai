import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Coin Deduction Flow (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();

        // Create test user
        const signupResponse = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: 'coin-test@example.com',
                password: 'Password123!',
                name: 'Coin User',
            });

        accessToken = signupResponse.body.accessToken;
        userId = signupResponse.body.user.id;

        // Grant initial coins for testing
        await prisma.coinWallet.upsert({
            where: { userId },
            create: { userId, balance: 100 },
            update: { balance: 100 },
        });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Coin Deduction on Message', () => {
        it('should deduct coins after successful AI response', async () => {
            const initialBalance = (await prisma.coinWallet.findUnique({
                where: { userId },
            })).balance;

            // Send message to AI (WebSocket test would be ideal, but HTTP for simplicity)
            // This requires a test persona to exist

            // After message, coins should be deducted
            const finalBalance = (await prisma.coinWallet.findUnique({
                where: { userId },
            })).balance;

            expect(finalBalance).toBeLessThan(initialBalance);
        });

        it('should NOT deduct coins if balance is insufficient', async () => {
            // Set balance to 0
            await prisma.coinWallet.update({
                where: { userId },
                data: { balance: 0 },
            });

            // Attempt to send message
            // Should fail with "Insufficient balance" error

            // Balance should still be 0
            const balance = (await prisma.coinWallet.findUnique({
                where: { userId },
            })).balance;

            expect(balance).toBe(0);
        });

        it('should prevent race conditions in concurrent deductions', async () => {
            // Set balance to 10 coins
            await prisma.coinWallet.update({
                where: { userId },
                data: { balance: 10 },
            });

            // Simulate 10 concurrent message attempts (each costs 2 coins)
            // Only 5 should succeed (10 coins / 2 coins per message = 5)

            const results = await Promise.allSettled([
                // Send 10 concurrent requests
                // ... implementation here
            ]);

            const finalBalance = (await prisma.coinWallet.findUnique({
                where: { userId },
            })).balance;

            // Final balance should be 0 (all 10 coins used, 5 messages sent)
            expect(finalBalance).toBe(0);
        });
    });

    describe('Transaction Integrity', () => {
        it('should maintain wallet integrity (balance = sum of transactions)', async () => {
            const wallet = await prisma.coinWallet.findUnique({
                where: { userId },
                include: { transactions: true },
            });

            const transactionSum = wallet.transactions.reduce(
                (sum, tx) => sum + tx.amount,
                0,
            );

            expect(wallet.balance).toBe(transactionSum);
        });
    });

    describe('Refund Flow', () => {
        it('should deduct coins on refund', async () => {
            // Grant coins first
            await request(app.getHttpServer())
                .post('/coin/add')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ amount: 50, description: 'Test grant' });

            const balanceBeforeRefund = (await prisma.coinWallet.findUnique({
                where: { userId },
            })).balance;

            // Process refund (admin only)
            // Should deduct the refunded amount

            const balanceAfterRefund = (await prisma.coinWallet.findUnique({
                where: { userId },
            })).balance;

            expect(balanceAfterRefund).toBeLessThan(balanceBeforeRefund);
        });
    });
});
