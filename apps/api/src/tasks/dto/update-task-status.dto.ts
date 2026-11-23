import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TaskStatus } from '../models/task.entity.js';

export class UpdateTaskStatusDto {
  @ApiProperty({
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.COMPLETE,
    description: 'New task status',
  })
  @IsEnum(TaskStatus, {
    message: 'status must be either "pending" or "complete"',
  })
  status!: TaskStatus;
}
