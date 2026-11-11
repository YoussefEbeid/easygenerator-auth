import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizeEmail, trimString } from './transforms';

// 8+ chars, at least one letter, one number and one special character
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export class SignUpDto {
  @ApiProperty({ example: 'jane@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @ApiProperty({ example: 'Jane Doe', minLength: 3 })
  @Transform(trimString)
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'hunter2025!', minLength: 8 })
  @IsString()
  @MaxLength(128)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters and include a letter, a number and a special character',
  })
  password: string;
}
