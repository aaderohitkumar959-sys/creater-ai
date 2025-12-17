import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    /**
     * GDPR: Request account deletion
     * Starts 30-day grace period
     */
    @Post('request-deletion')
    @UseGuards(JwtAuthGuard)
    async requestDeletion(@Req() req: any) {
        const userId = req.user.id;
        const result = await this.userService.requestDeletion(userId);

        return {
            message: 'Deletion requested. You have 30 days to cancel before your account is permanently deleted.',
            expiresAt: result.expiresAt,
        };
    }

    /**
     * GDPR: Confirm and execute deletion
     * Permanent - cannot be undone
     */
    @Delete('confirm-deletion/:token')
    async confirmDeletion(@Param('token') token: string) {
        await this.userService.confirmDeletion(token);

        return {
            message: 'Your account and all associated data have been permanently deleted.',
        };
    }

    /**
     * GDPR: Cancel deletion request
     */
    @Post('cancel-deletion')
    @UseGuards(JwtAuthGuard)
    async cancelDeletion(@Req() req: any) {
        const userId = req.user.id;
        await this.userService.cancelDeletion(userId);

        return {
            message: 'Deletion request cancelled. Your account is safe.',
        };
    }

    /**
     * GDPR: Export all user data
     */
    @Get('export-data')
    @UseGuards(JwtAuthGuard)
    async exportData(@Req() req: any) {
        const userId = req.user.id;
        const data = await this.userService.exportData(userId);

        return data;
    }

    /**
     * Get user profile
     */
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any) {
        const userId = req.user.id;
        // Implementation here
        return { userId };
    }
}
