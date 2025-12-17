# Phase 2 Infrastructure Setup Guide

## Redis Integration

### 1. Choose Redis Provider

**Option A: Upstash (Recommended for Vercel/Render)**
- Serverless Redis
- Free tier: 10K commands/day
- Pricing: $0.20 per 100K commands

**Option B: Redis Cloud**
- Managed Redis
- Free tier: 30MB
- Better for high-volume

**Option C: Render Redis**
- Native Render integration
- Pricing: $7/month starter

### 2. Setup Upstash (Recommended)

```bash
# 1. Sign up at https://upstash.com
# 2. Create new Redis database
# 3. Copy connection URL
```

### 3. Environment Variables

Add to `.env`:
```bash
REDIS_URL=rediss://default:PASSWORD@REGION.upstash.io:6379
```

### 4. Install Dependencies

```bash
cd apps/api
npm install ioredis @nestjs/bull bullmq
npm install --save-dev @types/ioredis
```

### 5. Create Redis Module

**File**: `apps/api/src/redis/redis.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => {
        return new Redis(config.get('REDIS_URL'));
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

### 6. Update App Module

```typescript
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // ... existing imports
    RedisModule,
  ],
})
export class AppModule {}
```

---

## BullMQ Message Queue

### 1. Create Queue Module

**File**: `apps/api/src/queue/queue.module.ts`

```typescript
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue(
      { name: 'ai-generation' },
      { name: 'content-moderation' },
      { name: 'memory-extraction' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
```

### 2. Create AI Generation Queue

**File**: `apps/api/src/queue/processors/ai-generation.processor.ts`

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('ai-generation')
export class AIGenerationProcessor extends WorkerHost {
  async process(job: Job) {
    const { userId, personaId, message } = job.data;
    
    // Process AI generation asynchronously
    // ... AI logic here
    
    return { success: true };
  }
}
```

### 3. Queue AI Jobs

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

constructor(@InjectQueue('ai-generation') private aiQueue: Queue) {}

async queueAIGeneration(data: any) {
  await this.aiQueue.add('generate', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}
```

---

## Socket.io Redis Adapter

### 1. Install Adapter

```bash
npm install @socket.io/redis-adapter
```

### 2. Configure in Chat Gateway

**File**: `apps/api/src/chat/chat.gateway.ts`

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@WebSocketGateway({ /* ... */ })
export class ChatGateway implements OnGatewayInit {
  constructor(
    @Inject(REDIS_CLIENT) private redisClient: Redis,
  ) {}

  afterInit(server: Server) {
    const pubClient = this.redisClient;
    const subClient = pubClient.duplicate();

    server.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.io Redis adapter configured');
  }
}
```

---

## Session Management with Redis

### 1. Install Session Store

```bash
npm install connect-redis express-session
npm install --save-dev @types/express-session
```

### 2. Configure Redis Session

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const redisClient = app.get(REDIS_CLIENT);
  
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );
}
```

---

## Rate Limiting with Redis

### 1. Update Throttler Config

```typescript
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        throttlers: [{ ttl: 60000, limit: 100 }],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),
  ],
})
```

---

## Database Connection Pooling

### 1. Update Prisma Configuration

**File**: `packages/database/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

### 2. Environment Variables

```bash
# Regular connection
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"

# For migrations
SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/shadow"
```

### 3. Connection Pool Settings

```typescript
// apps/api/src/prisma/prisma.service.ts
import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }
}
```

---

## Deployment Checklist

### Render.yaml Configuration

```yaml
services:
  - type: redis
    name: creatorai-redis
    plan: starter  # $7/month
    maxmemoryPolicy: allkeys-lru

  - type: web
    name: creatorai-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: creatorai-redis
          property: connectionString
```

### Testing

```bash
# Test Redis connection
node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(console.log);"

# Test BullMQ
npm run test:queue

# Load test WebSocket
npm run test:socket -- --users 1000
```

---

## Monitoring

### 1. Redis Monitoring

- Upstash Dashboard: https://console.upstash.com
- Commands: `INFO`, `MONITOR`, `CLIENT LIST`

### 2. Queue Monitoring

- BullMQ Dashboard: Install `@bull-board/api` and `@bull-board/express`
- Access at: http://localhost:3001/admin/queues

### 3. Performance Metrics

```typescript
// Track Redis operations
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));
```

---

## Estimated Costs

**At 10K Users (Monthly)**:
- Redis (Upstash): $20-50
- Database (Render): $100-200
- Backend (Render): $100-200

**Total Infrastructure**: ~$250/month at 10K users
