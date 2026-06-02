import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFIED'
  | 'ROLE_CHANGED'
  | 'STATUS_CHANGED'
  | 'USER_DELETED'
  | 'LOGOUT'
  | 'LOGOUT_ALL';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: AuditAction,
    params?: {
      userId?: string;
      metadata?: Prisma.InputJsonValue;
    },
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: params?.userId ?? null,
        action,
        metadata:
          params?.metadata === undefined ? Prisma.JsonNull : params.metadata,
      },
      select: {
        id: true,
      },
    });
  }
}
