import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({
    example: 2,
    description: 'ID of the user to assign the task to',
    minimum: 1,
  })
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be at least 1' })
  userId!: number;
}
