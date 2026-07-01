import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from '../auth/jwt.guard';

type AuthRequest = ExpressRequest & { user: { id: string } };

@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('productivity')
  async getProductivityMetrics(@Request() req: AuthRequest) {
    return this.analyticsService.getProductivityMetrics(req.user.id);
  }

  @Get('summary')
  async getSummary(@Request() req: AuthRequest) {
    return this.analyticsService.getSummary(req.user.id);
  }
}
