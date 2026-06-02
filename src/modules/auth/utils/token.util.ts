import type { Request } from 'express';

export function extractRefreshToken(
  request: Request,
  bodyToken?: string,
): string | undefined {
  if (bodyToken && bodyToken.trim().length > 0) {
    return bodyToken.trim();
  }

  const cookieToken = request.cookies?.refreshToken;
  if (typeof cookieToken === 'string' && cookieToken.trim().length > 0) {
    return cookieToken.trim();
  }

  return undefined;
}
