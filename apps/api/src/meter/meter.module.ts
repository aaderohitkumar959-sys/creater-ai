import { Module } from '@nestjs/common';
import { MeteredService } from './meter.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MeteredService],
  exports: [MeteredService],
})
export class MeterModule {}
