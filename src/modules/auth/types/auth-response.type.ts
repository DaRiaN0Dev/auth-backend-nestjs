import type { UserRole, UserStatus } from '@prisma/client';

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  sub: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface SessionResponse {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
}
