import { ApiProperty } from '@nestjs/swagger';

export class SmartRepliesResponseDto {
  @ApiProperty({ type: [String] })
  replies!: string[];
}