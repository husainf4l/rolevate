import { Controller, Get, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SecurityService, SecurityMetrics } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Get('metrics')
  @UseGuards(AdminGuard)
  async getSecurityMetrics(
    @Query('timeframe') timeframe: 'hour' | 'day' | 'week' = 'day',
  ): Promise<SecurityMetrics> {
    return this.securityService.getSecurityMetrics(timeframe);
  }

  @Get('health')
  @UseGuards(JwtAuthGuard)
  async getSecurityHealth(): Promise<{ status: string; timestamp: Date }> {
    // Basic security health check - requires authentication
    return {
      status: 'healthy',
      timestamp: new Date(),
    };
  }
}