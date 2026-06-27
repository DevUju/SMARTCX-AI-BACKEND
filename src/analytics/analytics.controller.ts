import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('productivity')
  async getProductivityMetrics(@Request() req) {
    return this.analyticsService.getProductivityMetrics(req.user.id);
  }

  @Get('summary')
  async getSummary(@Request() req) {
    return this.analyticsService.getSummary(req.user.id);
  }
}
