import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Request() req, @Body() subscription: any) {
    return this.notificationService.subscribe(req.user.userId, subscription);
  }

  @UseGuards(JwtAuthGuard)
  @Post('test')
  async testNotification(@Request() req) {
    return this.notificationService.sendNotification(req.user.userId, {
      title: 'Test Notification',
      body: 'This is a test notification from CreatorAI!',
      url: '/dashboard',
    });
  }
}
