import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  dueDate: Date;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority: string = 'medium';

  @IsOptional()
  projectId: string;
}

export class UpdateTaskDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  dueDate: Date;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority: string;

  @IsOptional()
  @IsIn(['pending', 'in-progress', 'completed'])
  status: string;
}
