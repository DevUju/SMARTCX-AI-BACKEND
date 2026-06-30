// import { ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsObject, IsString } from 'class-validator';

// export class InboundWebhookDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   eventId!: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   source!: string;

//   @ApiProperty({ type: 'object', additionalProperties: true })
//   @IsObject()
//   payload!: Record<string, unknown>;
// }
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InboundWebhookDto {
  @ApiProperty({ description: 'The business this message is for' })
  @IsUUID()
  businessId!: string;

  @ApiProperty({ example: 'Chidi Okafor' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ required: false, example: '08112345671' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, example: 'chidi@yopmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'My order hasn\'t arrived yet' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
