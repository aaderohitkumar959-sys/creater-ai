import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    console.log('[Prisma] initializing...');

    if (!dbUrl) {
      console.error('[Prisma] FATAL: DATABASE_URL is undefined in environment variables.');
    } else {
      console.log(`[Prisma] Connection Config Check:
      - Defined: YES
      - SSL Required: ${dbUrl.includes('sslmode=require')}
      - Host: ${dbUrl.split('@')[1]?.split('/')[0] || 'unknown'}
      `);
    }

    try {
      console.log('[Prisma] Attempting connection...');
      await this.$connect();
      console.log('[Prisma] ✅ Successfully connected to database.');
    } catch (error) {
      console.error('[Prisma] ❌ Failed to connect to database. REAL ERROR BELOW:');
      console.error(error);
      // Re-throw so the app crashes and restarts (or is caught by filter if we want, but DB death usually should crash)
      // Actually, for the failsafe to work, we might want to NOT crash, but we need the Service to be usable.
      // NestJS generic behavior is to crash on init failure. We'll throw.
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
