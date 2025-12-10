import { Controller, Get, Param, Query, Patch, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('personas')
export class PersonaController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllPersonas(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    return this.prisma.persona.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            bio: true,
            user: { select: { name: true, image: true } },
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

  @Patch(':id')
  async updatePersona(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      defaultCoinCost?: number;
      isFeatured?: boolean;
    },
  ) {
    return this.prisma.persona.update({
      where: { id },
      data,
    });
  }
}
