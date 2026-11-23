import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'maria',
    description: 'username',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  username!: string;

  @ApiProperty({
    example: 'MiClave123',
    format: 'password',
    minLength: 1,
    writeOnly: true,
  })
  @IsString()
  @MinLength(1)
  password!: string;
}
