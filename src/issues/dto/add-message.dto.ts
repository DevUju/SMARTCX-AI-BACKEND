import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddIssueMessageDto {
  @ApiProperty({ example: 'Thanks for reaching out, your refund is being processed.' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}