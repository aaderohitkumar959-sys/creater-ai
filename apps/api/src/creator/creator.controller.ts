import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreatorService } from './creator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('creator')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(@Request() req, @Body() body: { bio: string }) {
    return this.creatorService.createCreatorProfile(req.user.userId, body.bio);
  }

  @UseGuards(JwtAuthGuard)
  @Post('persona')
  async createPersona(
    @Request() req,
    @Body()
    body: {
      name: string;
      description: string;
      avatarUrl?: string;
      personality: any;
    },
  ) {
    // First get creator ID
    const creator = await this.creatorService.getCreatorProfile(
      req.user.userId,
    );
    if (!creator) {
      throw new Error('Creator profile not found');
    }
    return this.creatorService.createPersona(creator.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('training-data')
  async addTrainingData(@Body() body: { personaId: string; content: string }) {
    return this.creatorService.addTrainingData(body.personaId, body.content);
  }
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.creatorService.getDashboardStats(req.user.userId);
  }
}
