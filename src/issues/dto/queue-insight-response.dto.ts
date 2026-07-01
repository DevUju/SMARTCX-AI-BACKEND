import { ApiProperty } from '@nestjs/swagger';

export class QueueInsightResponseDto {
  @ApiProperty()
  summary!: string;
}