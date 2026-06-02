import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, description: 'User status to set' })
  @IsEnum(UserStatus)
  readonly status!: UserStatus;
}

