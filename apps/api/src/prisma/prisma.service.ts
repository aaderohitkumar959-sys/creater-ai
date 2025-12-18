import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('[Prisma] Connecting to database...');
    try {
      await this.$connect();
      console.log('[Prisma] Successfully connected to database.');
    } catch (error) {
      console.error('[Prisma] Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
