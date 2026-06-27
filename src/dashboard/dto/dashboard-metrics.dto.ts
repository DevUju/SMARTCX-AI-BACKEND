import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty({ example: 124 })
  openTickets!: number;

  @ApiProperty({ example: 45 })
  resolvedLast24h!: number;

  @ApiProperty({ example: 12 })
  resolvedLast24hChangePercent!: number;

  @ApiProperty({ example: 1.2 })
  avgResponseHours!: number;
}