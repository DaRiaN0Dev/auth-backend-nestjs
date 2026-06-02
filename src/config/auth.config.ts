import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '',
  }),
);
