import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('personas')
export class PersonaController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getAllPersonas() {
        return this.prisma.persona.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        bio: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    @Get('featured')
    async getFeaturedPersonas() {
        return this.prisma.persona.findMany({
            where: {
                isFeatured: true,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        bio: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    @Get(':id')
    async getPersona(@Param('id') id: string) {
        return this.prisma.persona.findUnique({
            where: { id },
            include: {
                creator: true,
            },
        });
    }
}
