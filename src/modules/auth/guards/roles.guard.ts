import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../types/request-with-user.type';

function canAccess(required: UserRole, actual: UserRole): boolean {
  if (actual === 'OWNER') {
    return true;
  }

  if (required === 'USER') {
    return true;
  }

  if (required === 'ADMIN') {
    return actual === 'ADMIN';
  }

  // required OWNER
  return false;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return requiredRoles.some((role) => canAccess(role, request.user.role));
  }
}
