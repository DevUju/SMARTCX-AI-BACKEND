import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  progress: number = 0;
}

export class UpdateProjectDto {
  @IsOptional()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  progress: number;

  @IsOptional()
  @IsIn(['active', 'archived', 'completed'])
  status: string;
}
