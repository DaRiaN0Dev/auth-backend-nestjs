import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ required: false, description: 'Refresh token (can also be in cookie)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly refreshToken?: string;
}
