import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskResponseDto {
  @ApiProperty({
    example: 'Task created successfully',
    description: 'Confirmation message',
  })
  message!: string;
}
