import { IsOptional, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly refreshToken?: string;
}
