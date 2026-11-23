import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

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
    type: String,
    example: 'Collect the latest quarterly figures',
    description: 'Optional task description',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string | null;
}
