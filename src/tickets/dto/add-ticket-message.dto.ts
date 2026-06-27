import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MessageSenderType } from 'src/common/enums/message-sender-type.enum';

export class AddTicketMessageDto {
  @ApiProperty({ example: 'We have escalated your case and will update shortly.' })
  @IsString()
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ enum: MessageSenderType, default: MessageSenderType.AGENT })
  @IsOptional()
  @IsEnum(MessageSenderType)
  senderType?: MessageSenderType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isInternalNote?: boolean;
}