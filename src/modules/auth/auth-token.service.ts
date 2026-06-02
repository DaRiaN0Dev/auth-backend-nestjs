import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { EnvVariables } from '../../types/env.types';
import type { JwtAccessPayload, JwtRefreshPayload } from './types/auth-response.type';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvVariables, true>,
  ) {}

  generateAccessToken(user: User): Promise<string> {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
    });
  }

  generateRefreshToken(user: User): Promise<string> {
    const payload: JwtRefreshPayload = {
      sub: user.id,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true }),
    });
  }

  verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    return this.jwtService.verifyAsync<JwtRefreshPayload>(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
    });
  }
}
