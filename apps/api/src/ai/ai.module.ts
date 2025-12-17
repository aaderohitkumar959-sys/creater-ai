import { Module } from '@nestjs/common';
import { ProductionAIService } from './production-ai.service';
import { AIMemoryService } from './ai-memory.service';
import { MemoryController } from './memory.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MemoryController],
    providers: [ProductionAIService, AIMemoryService],
    exports: [ProductionAIService, AIMemoryService],
})
export class AIModule { }
