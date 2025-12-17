import { Controller, Get, Delete, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AIMemoryService } from './ai-memory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('memory')
@UseGuards(JwtAuthGuard)
export class MemoryController {
    constructor(private memoryService: AIMemoryService) { }

    /**
     * Get all memories for authenticated user
     */
    @Get()
    async getMemories(@Req() req: any) {
        const userId = req.user.id;
        const memories = await this.memoryService.getUserMemories(userId);

        return {
            memories,
            count: memories.length,
        };
    }

    /**
     * Get memories for specific persona
     */
    @Get('persona/:personaId')
    async getPersonaMemories(@Req() req: any, @Param('personaId') personaId: string) {
        const userId = req.user.id;
        const memories = await this.memoryService.getUserMemories(userId, personaId);

        return {
            memories,
            count: memories.length,
        };
    }

    /**
     * Get memory statistics
     */
    @Get('stats')
    async getMemoryStats(@Req() req: any) {
        const userId = req.user.id;
        return await this.memoryService.getMemoryStats(userId);
    }

    /**
     * Delete specific memory
     */
    @Delete(':memoryId')
    async deleteMemory(@Req() req: any, @Param('memoryId') memoryId: string) {
        const userId = req.user.id;
        const deleted = await this.memoryService.deleteMemory(memoryId, userId);

        if (deleted) {
            return { message: 'Memory deleted successfully' };
        } else {
            throw new Error('Failed to delete memory');
        }
    }

    /**
     * Delete all memories
     */
    @Delete()
    async deleteAllMemories(@Req() req: any) {
        const userId = req.user.id;
        const count = await this.memoryService.deleteAllUserMemories(userId);

        return {
            message: `Deleted ${count} memories`,
            count,
        };
    }

    /**
     * Trigger memory extraction for a conversation (manual)
     */
    @Post('extract/:conversationId')
    async extractMemories(
        @Req() req: any,
        @Param('conversationId') conversationId: string,
    ) {
        const userId = req.user.id;

        // Get conversation to find personaId
        const conversation = await this.memoryService['prisma'].conversation.findUnique({
            where: { id: conversationId },
            include: { persona: true },
        });

        if (!conversation || conversation.userId !== userId) {
            throw new Error('Conversation not found');
        }

        const count = await this.memoryService.extractMemoriesFromConversation(
            conversationId,
            userId,
            conversation.personaId,
        );

        return {
            message: `Extracted ${count} memories`,
            count,
        };
    }
}
