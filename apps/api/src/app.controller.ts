import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/deep')
  async healthDeep() {
    // TODO: Add database connectivity check
    return {
      status: 'ok',
      checks: {
        server: { status: 'ok', uptime: process.uptime() },
        timestamp: new Date().toISOString(),
      },
    };
  }
}
