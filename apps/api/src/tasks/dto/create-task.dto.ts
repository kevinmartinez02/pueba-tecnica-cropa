import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Prepare the quarterly presentation',
    description: 'Task title',
    minLength: 1,
  })
  @IsString({ message: 'title must be a string' })
  @Matches(/\S/, { message: 'title must not be blank' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Collect the latest quarterly figures',
    description: 'Optional task description',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID of the user assigned to the task',
    minimum: 1,
  })
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be at least 1' })
  userId!: number;
}
