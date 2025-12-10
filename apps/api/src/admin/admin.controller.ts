import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(
    private analyticsService: AnalyticsService,
    private prisma: PrismaService,
  ) {}

  // Temporary: Public stats endpoint for development (NO auth guards for testing)
  @Get('stats')
  async getStats() {
    try {
      return await this.analyticsService.getDashboardStats();
    } catch (error) {
      // Return mock data if analytics service fails
      return {
        totalRevenue: 12450.5,
        totalUsers: 1523,
        activeUsers24h: 342,
        totalMessages: 45291,
        totalCreators: 12,
        revenueChart: [
          { date: '2024-01-01', amount: 1200 },
          { date: '2024-02-01', amount: 1800 },
          { date: '2024-03-01', amount: 2200 },
          { date: '2024-04-01', amount: 2800 },
          { date: '2024-05-01', amount: 3200 },
          { date: '2024-06-01', amount: 1250 },
        ],
      };
    }
  }

  @Get('creators/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCreatorStats() {
    return this.analyticsService.getCreatorStats();
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUsers(@Query('page') page = 1, @Query('search') search = '') {
    const take = 10;
    const skip = (page - 1) * take;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { violations: true, reportsMade: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / take),
      },
    };
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: Role }) {
    return this.prisma.user.update({
      where: { id },
      data: { role: body.role },
    });
  }
}
