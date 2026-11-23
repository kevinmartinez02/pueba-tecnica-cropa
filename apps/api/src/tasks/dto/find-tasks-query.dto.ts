import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class FindTasksQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter tasks by assigned user ID',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be at least 1' })
  userId?: number;
}
