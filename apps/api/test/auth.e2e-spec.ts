import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication Flow (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = app.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/signup', () => {
        it('should create a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test@example.com',
                    password: 'StrongPassword123!',
                    name: 'Test User',
                })
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should reject duplicate email', async () => {
            await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'duplicate@example.com',
                    password: 'Password123!',
                    name: 'First User',
                })
                .expect(201);

            await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'duplicate@example.com',
                    password: 'Password123!',
                    name: 'Second User',
                })
                .expect(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            // Create user first
            await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!',
                    name: 'Login User',
                });

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!',
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('user');
        });

        it('should reject invalid credentials', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'WrongPassword123!',
                })
                .expect(401);
        });

        it('should enforce rate limiting after 5 attempts', async () => {
            for (let i = 0; i < 5; i++) {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'ratelimit@example.com',
                        password: 'WrongPassword',
                    });
            }

            // 6th attempt should be blocked
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'ratelimit@example.com',
                    password: 'WrongPassword',
                })
                .expect(429);
        });
    });

    describe('GET /auth/me', () => {
        let accessToken: string;

        beforeEach(async () => {
            const signupResponse = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'me@example.com',
                    password: 'Password123!',
                    name: 'Me User',
                });

            accessToken = signupResponse.body.accessToken;
        });

        it('should return user profile with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.email).toBe('me@example.com');
        });

        it('should reject invalid token', async () => {
            await request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
});
