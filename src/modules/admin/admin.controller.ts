import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { UserRole, UserStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/auth-response.type';
import { AdminService, AdminUsersListResponse } from './admin.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users.query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Throttle({ default: { limit: 50, ttl: seconds(60) } })
@Roles(UserRole.ADMIN, UserRole.OWNER)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users list retrieved', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  listUsers(@Query() query: AdminListUsersQueryDto): Promise<AdminUsersListResponse> {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Roles(UserRole.OWNER)
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (owner only)' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - owner only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateRole(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<{ success: true }> {
    return this.adminService.updateRole(currentUser.id, id, dto.role);
  }

  @Roles(UserRole.OWNER)
  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (owner only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - owner only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<{ success: true }> {
    return this.adminService.updateStatus(currentUser.id, id, dto.status);
  }

  @Roles(UserRole.OWNER)
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (owner only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - owner only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ success: true }> {
    return this.adminService.deleteUser(currentUser.id, id);
  }
}

