import { IsEmail, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsIn(['Manager', 'Freelancer'])
  persona: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
