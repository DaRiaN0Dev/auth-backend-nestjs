import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  @MinLength(1)
  readonly token!: string;

  @ApiProperty({ example: 'NewSecurePass456!', description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  readonly password!: string;
}
