import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import type { EnvVariables } from '../../types/env.types';
import { AUTH_SALT_ROUNDS, REFRESH_TOKEN_SALT_ROUNDS } from './constants/auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import type { User } from '@prisma/client';
import type {
  AuthResponse,
  JwtRefreshPayload,
  SafeUser,
  SessionResponse,
} from './types/auth-response.type';
import { durationToMs } from './utils/duration.util';
import { AuthTokenService } from './auth-token.service';
import { generateSecureToken } from './utils/secure-token.util';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';

function hashIpAddress(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authTokenService: AuthTokenService,
    private readonly configService: ConfigService<EnvVariables, true>,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: SignUpDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, AUTH_SALT_ROUNDS);

    const createdUser = await this.prisma.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    return { user: this.toSafeUser(createdUser) };
  }

  async login(dto: SignInDto, request: Request): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      await this.auditService.log('LOGIN_FAILED', {
        metadata: { email: normalizedEmail, reason: 'USER_NOT_FOUND' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.auditService.log('LOGIN_FAILED', {
        userId: user.id,
        metadata: { reason: 'ACCOUNT_LOCKED' },
      });
      throw new ForbiddenException('Account temporarily locked');
    }

    if (user.status !== 'ACTIVE') {
      await this.auditService.log('LOGIN_FAILED', {
        userId: user.id,
        metadata: { reason: 'ACCOUNT_INACTIVE', status: user.status },
      });
      throw new ForbiddenException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true },
      });

      const shouldLock = updated.failedLoginAttempts >= 5;
      if (shouldLock) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          },
          select: { id: true },
        });
      }

      await this.auditService.log('LOGIN_FAILED', {
        userId: user.id,
        metadata: { reason: 'INVALID_PASSWORD', locked: shouldLock },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.failedLoginAttempts !== 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
        select: { id: true },
      });
    }

    const accessToken = await this.authTokenService.generateAccessToken(user);
    const refreshToken = await this.authTokenService.generateRefreshToken(user);
    await this.persistRefreshToken(user.id, refreshToken);
    await this.createSession(user.id, request);

    await this.auditService.log('LOGIN_SUCCESS', {
      userId: user.id,
      metadata: {
        ipAddress: hashIpAddress(request.ip),
        userAgent: request.headers['user-agent'] ? String(request.headers['user-agent']).substring(0, 100) : null,
      },
    });

    return {
      user: this.toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string, request: Request): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(token);
    const tokenRecord = await this.findValidStoredRefreshToken(payload.sub, token);

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.authTokenService.generateAccessToken(user);
    const refreshToken = await this.authTokenService.generateRefreshToken(user);

    await this.persistRefreshToken(user.id, refreshToken);
    await this.createSession(user.id, request);

    return {
      user: this.toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async logout(token: string, request: Request): Promise<{ success: true }> {
    const payload = await this.verifyRefreshToken(token);
    const tokenRecord = await this.findValidStoredRefreshToken(payload.sub, token);

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    await this.auditService.log('LOGOUT', {
      userId: payload.sub,
      metadata: {
        ipAddress: hashIpAddress(request.ip),
        userAgent: request.headers['user-agent'] ? String(request.headers['user-agent']).substring(0, 100) : null,
      },
    });
    return { success: true };
  }

  async logoutAll(userId: string, request: Request): Promise<{ success: true }> {
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.session.deleteMany({
        where: { userId },
      }),
    ]);

    await this.auditService.log('LOGOUT_ALL', {
      userId,
      metadata: {
        ipAddress: hashIpAddress(request.ip),
        userAgent: request.headers['user-agent'] ? String(request.headers['user-agent']).substring(0, 100) : null,
      },
    });
    return { success: true };
  }

  async sendVerificationEmail(userId: string): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, emailVerified: true, firstName: true, email: true },
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const token = generateSecureToken();

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.deleteMany({
        where: {
          userId,
          expiresAt: { gt: now },
        },
      }),
      this.prisma.emailVerificationToken.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      }),
    ]);

    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      token,
    );

    return { success: true };
  }

  async verifyEmail(dto: VerifyEmailDto, request: Request): Promise<{ success: true }> {
    const tokenRecord = await this.prisma.emailVerificationToken.findUnique({
      where: { token: dto.token },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!tokenRecord) {
      throw new NotFoundException();
    }

    const now = new Date();
    if (tokenRecord.expiresAt <= now) {
      await this.prisma.emailVerificationToken.delete({ where: { id: tokenRecord.id } });
      throw new BadRequestException('Token expired');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: true, status: 'ACTIVE' },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { id: tokenRecord.id },
      }),
    ]);

    await this.auditService.log('EMAIL_VERIFIED', {
      userId: tokenRecord.userId,
      metadata: {
        ipAddress: hashIpAddress(request.ip),
        userAgent: request.headers['user-agent'] ? String(request.headers['user-agent']).substring(0, 100) : null,
      },
    });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: true }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, firstName: true, email: true },
    });

    if (!user) {
      return { success: true };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    const token = generateSecureToken();

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          expiresAt: { gt: now },
        },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      }),
    ]);

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      token,
    );

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto, request: Request): Promise<{ success: true }> {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid token');
    }

    const now = new Date();
    if (tokenRecord.expiresAt <= now) {
      await this.prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
      throw new BadRequestException('Token expired');
    }

    const passwordHash = await bcrypt.hash(dto.password, AUTH_SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.delete({
        where: { id: tokenRecord.id },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.session.deleteMany({
        where: { userId: tokenRecord.userId },
      }),
    ]);

    await this.auditService.log('PASSWORD_RESET', {
      userId: tokenRecord.userId,
      metadata: {
        ipAddress: hashIpAddress(request.ip),
        userAgent: request.headers['user-agent'] ? String(request.headers['user-agent']).substring(0, 100) : null,
      },
    });
    return { success: true };
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toSafeUser(user);
  }

  async getSessions(userId: string): Promise<SessionResponse[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    }));
  }

  private async verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    try {
      return await this.authTokenService.verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async persistRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    const refreshTtl = this.configService.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true });
    const expiresAt = new Date(Date.now() + durationToMs(refreshTtl));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  private async findValidStoredRefreshToken(
    userId: string,
    rawRefreshToken: string,
  ): Promise<{ id: string }> {
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        tokenHash: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (const token of activeTokens) {
      const isMatch = await bcrypt.compare(rawRefreshToken, token.tokenHash);
      if (isMatch) {
        return { id: token.id };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private async createSession(userId: string, request: Request): Promise<void> {
    const refreshTtl = this.configService.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true });
    const expiresAt = new Date(Date.now() + durationToMs(refreshTtl));
    const userAgent = request.headers['user-agent'];
    const normalizedUserAgent = typeof userAgent === 'string' ? userAgent : null;
    const ipAddress = request.ip ?? null;

    await this.prisma.session.create({
      data: {
        userId,
        userAgent: normalizedUserAgent,
        ipAddress,
        expiresAt,
      },
    });
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
