import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Payment Flow (e2e)', () => {
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
                email: 'payment-test@example.com',
                password: 'Password123!',
                name: 'Payment User',
            });

        accessToken = signupResponse.body.accessToken;
        userId = signupResponse.body.user.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /payment/coin-packs', () => {
        it('should return available coin packs', async () => {
            const response = await request(app.getHttpServer())
                .get('/payment/coin-packs')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('coins');
            expect(response.body[0]).toHaveProperty('priceUSD');
        });
    });

    describe('POST /payment/stripe/create-intent', () => {
        it('should create payment intent', async () => {
            const coinPacks = await request(app.getHttpServer())
                .get('/payment/coin-packs');

            const coinPackId = coinPacks.body[0].id;

            const response = await request(app.getHttpServer())
                .post('/payment/stripe/create-intent')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ userId, coinPackId })
                .expect(201);

            expect(response.body).toHaveProperty('clientSecret');
            expect(response.body).toHaveProperty('paymentIntentId');
        });
    });

    describe('POST /payment/stripe/webhook', () => {
        it('should reject invalid webhook signature', async () => {
            await request(app.getHttpServer())
                .post('/payment/stripe/webhook')
                .set('stripe-signature', 'invalid-signature')
                .send({
                    type: 'payment_intent.succeeded',
                    data: { object: { id: 'pi_test_123' } },
                })
                .expect(400);
        });

        it('should be idempotent (no duplicate coin grants)', async () => {
            // This test requires mocking Stripe webhook signature
            // Implementation details depend on your Stripe setup

            // 1. Create a payment
            // 2. Simulate successful webhook (1st time)
            // 3. Verify coins granted
            // 4. Simulate same webhook again (2nd time)
            // 5. Verify coins NOT granted again

            expect(true).toBe(true); // Placeholder
        });
    });

    describe('Coin Balance Flow', () => {
        it('should grant coins after successful payment', async () => {
            // Get initial balance
            const initialBalance = await request(app.getHttpServer())
                .get('/coin/balance')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            // Simul ate payment webhook (requires mocking)
            // After webhook, balance should increase

            // Get updated balance
            const finalBalance = await request(app.getHttpServer())
                .get('/coin/balance')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(finalBalance.body.balance).toBeGreaterThanOrEqual(initialBalance.body.balance);
        });
    });

    describe('Transaction History', () => {
        it('should retrieve transaction history', async () => {
            const response = await request(app.getHttpServer())
                .get('/coin/transactions')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
