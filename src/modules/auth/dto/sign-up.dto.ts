import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @Length(2, 50)
  readonly firstName!: string;

  @IsString()
  @Length(2, 50)
  readonly lastName!: string;

  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  readonly password!: string;
}
