import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { ChannelType } from 'src/common/enums/channel-type.enum';

export class ConnectChannelDto {
  @ApiProperty({ enum: ChannelType })
  @IsEnum(ChannelType)
  type!: ChannelType;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  @IsObject()
  @IsNotEmpty()
  credentials!: Record<string, string>;
}