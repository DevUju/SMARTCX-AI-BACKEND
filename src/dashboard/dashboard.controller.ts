import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { DashboardTrendsDto } from './dto/dashboard-trends.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get dashboard metrics for current business tenant' })
  @ApiResponse({ status: 200, type: DashboardMetricsDto })
  async getMetrics(@CurrentUser() user: AuthenticatedUser): Promise<DashboardMetricsDto> {
    return this.dashboardService.getMetrics(user.businessId);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get dashboard performance trends for current business tenant' })
  @ApiResponse({ status: 200, type: DashboardTrendsDto })
  async getTrends(@CurrentUser() user: AuthenticatedUser): Promise<DashboardTrendsDto> {
    return this.dashboardService.getTrends(user.businessId);
  }

  @Get('ai-insight')
@ApiOperation({ summary: 'Get AI-generated insight for the current ticket landscape' })
@ApiResponse({ status: 200 })
async getAiInsight(
  @CurrentUser() user: AuthenticatedUser,
): Promise<{ summary: string }> {
  return this.dashboardService.getAiInsight(user.businessId);
}
}