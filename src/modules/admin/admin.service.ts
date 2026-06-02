import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { SafeUser } from '../auth/types/auth-response.type';
import { AuditService } from '../audit/audit.service';
import type { AdminListUsersQueryDto } from './dto/admin-list-users.query.dto';
import type { UserRole, UserStatus } from '@prisma/client';

export interface AdminUsersListResponse {
  total: number;
  page: number;
  limit: number;
  users: SafeUser[];
}

function toSafeUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
}): SafeUser {
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

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listUsers(query: AdminListUsersQueryDto): Promise<AdminUsersListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where =
      search && search.length > 0
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      users: users.map(toSafeUser),
    };
  }

  async getUser(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return toSafeUser(user);
  }

  async updateRole(currentUserId: string, id: string, role: UserRole): Promise<{ success: true }> {
    if (currentUserId === id) {
      throw new ConflictException('OWNER cannot change their own role');
    }

    await this.ensureUserExists(id);

    await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    await this.auditService.log('ROLE_CHANGED', {
      userId: currentUserId,
      metadata: { targetUserId: id, role },
    });

    return { success: true };
  }

  async updateStatus(currentUserId: string, id: string, status: UserStatus): Promise<{ success: true }> {
    if (currentUserId === id && status !== 'ACTIVE') {
      throw new ConflictException('OWNER cannot change their own status');
    }

    await this.ensureUserExists(id);

    await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    await this.auditService.log('STATUS_CHANGED', {
      userId: currentUserId,
      metadata: { targetUserId: id, status },
    });

    return { success: true };
  }

  async deleteUser(currentUserId: string, id: string): Promise<{ success: true }> {
    if (currentUserId === id) {
      throw new ConflictException('OWNER cannot delete their own account');
    }

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch {
      throw new NotFoundException();
    }

    await this.auditService.log('USER_DELETED', {
      userId: currentUserId,
      metadata: { targetUserId: id },
    });

    return { success: true };
  }

  private async ensureUserExists(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException();
  }
}

