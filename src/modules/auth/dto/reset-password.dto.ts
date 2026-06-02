import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  readonly token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  readonly password!: string;
}
