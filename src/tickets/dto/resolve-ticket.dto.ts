import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveTicketDto {
  @ApiProperty({ example: 'Issue resolved after logistics confirmation and customer follow-up.' })
  @IsString()
  @MaxLength(10000)
  resolutionSummary!: string;

  @ApiPropertyOptional({ example: 'frustrated' })
  @IsOptional()
  @IsString()
  sentimentShiftStart?: string;

  @ApiPropertyOptional({ example: 'positive' })
  @IsOptional()
  @IsString()
  sentimentShiftEnd?: string;
}