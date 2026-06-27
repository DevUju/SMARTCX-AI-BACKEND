import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  date: Date;

  @IsOptional()
  time: string;
}

export class UpdateEventDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  date: Date;

  @IsOptional()
  time: string;
}
