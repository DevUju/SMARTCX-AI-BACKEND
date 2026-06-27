import { ApiProperty } from '@nestjs/swagger';

export class DashboardTrendPointDto {
  @ApiProperty({ example: '08:00' })
  time!: string;

  @ApiProperty({ example: 18 })
  ticketsOpened!: number;

  @ApiProperty({ example: 14 })
  ticketsResolved!: number;
}

export class DashboardTrendsDto {
  @ApiProperty({ type: [DashboardTrendPointDto] })
  points!: DashboardTrendPointDto[];
}