import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token from email' })
  @IsString()
  @MinLength(1)
  readonly token!: string;
}
