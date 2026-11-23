import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'maria',
    description: 'Username used to sign in',
    minLength: 1,
  })
  @IsString({ message: 'username must be a string' })
  @MinLength(1, { message: 'username must not be empty' })
  username!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Password to compare with the stored bcrypt hash',
    format: 'password',
    minLength: 1,
    writeOnly: true,
  })
  @IsString({ message: 'password must be a string' })
  @MinLength(1, { message: 'password must not be empty' })
  password!: string;
}
