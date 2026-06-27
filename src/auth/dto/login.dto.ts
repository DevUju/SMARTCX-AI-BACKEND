import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@smartcx.ai' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StrongPassword@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}