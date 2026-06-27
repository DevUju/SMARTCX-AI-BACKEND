import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({ example: 'Riverside Retail' })
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @ApiProperty({ example: 'Ada Okafor' })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Retail' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 'owner@riversideretail.ng' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}