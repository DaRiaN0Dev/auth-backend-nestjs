import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly password!: string;
}
