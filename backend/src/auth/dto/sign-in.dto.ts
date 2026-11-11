import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { normalizeEmail } from './transforms';

export class SignInDto {
  @ApiProperty({ example: 'jane@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
