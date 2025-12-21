import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { FailsafeFilter } from './common/filters/failsafe.filter';

async function bootstrap() {
  console.log('[Bootstrap] Starting NestJS application...');
  const app = await NestFactory.create(AppModule);
  console.log('[Bootstrap] NestJS application created.');

  // 1. Enable Helmet with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://js.stripe.com',
            'https://checkout.razorpay.com',
          ],
          frameSrc: [
            "'self'",
            'https://js.stripe.com',
            'https://api.razorpay.com',
          ],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // 2. Strict CORS - Allow production Vercel and localhost
  const allowedOrigins = [
    'https://syelope-web.vercel.app',  // New Production Domain
    'https://creater-ai-web.vercel.app',  // Legacy Production Domain
    'http://localhost:3000',               // Local dev
    'http://localhost:3001',               // Local backend dev
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      // Check explicit allow list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check Vercel deployments (preview/production)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Add logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // SMART FAILSAFE: Catch all errors, Log them, then return friendly UI if needed
  app.useGlobalFilters(new FailsafeFilter());

  const port = process.env.PORT ?? 3001;
  console.log(`[Bootstrap] Attempting to listen on port ${port}...`);
  await app.listen(port, '0.0.0.0');
  console.log(`[Bootstrap] Application is running on: ${await app.getUrl()}`);
}
bootstrap();
