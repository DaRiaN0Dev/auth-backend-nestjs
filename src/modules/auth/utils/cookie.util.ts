import { ConfigService } from '@nestjs/config';
import type { EnvVariables } from '../../../types/env.types';

export function getRefreshCookieOptions(configService: ConfigService<EnvVariables, true>) {
  const nodeEnv = configService.get('NODE_ENV', { infer: true });
  const isProduction = nodeEnv === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}
