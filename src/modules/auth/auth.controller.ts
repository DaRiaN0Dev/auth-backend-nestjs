import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { Throttle, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { CurrentUser } from './decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { extractRefreshToken } from './utils/token.util';
import type { AuthResponse, AuthenticatedUser, SafeUser, SessionResponse } from './types/auth-response.type';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: Object })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  signUp(@Body() dto: SignUpDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('sign-in')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'Successfully signed in', type: Object })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account temporarily locked' })
  signIn(@Body() dto: SignInDto, @Req() request: Request): Promise<AuthResponse> {
    return this.authService.login(dto, request);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed', type: Object })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request): Promise<AuthResponse> {
    const refreshToken = extractRefreshToken(request, dto.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.refresh(refreshToken, request);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  logout(@Body() dto: LogoutDto, @Req() request: Request): Promise<{ success: true }> {
    const refreshToken = extractRefreshToken(request, dto.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.logout(refreshToken, request);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout all sessions' })
  @ApiResponse({ status: 200, description: 'Successfully logged out from all sessions' })
  logoutAll(@CurrentUser() user: AuthenticatedUser, @Req() request: Request): Promise<{ success: true }> {
    return this.authService.logoutAll(user.id, request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<SafeUser> {
    return this.authService.me(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved', type: [Object] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  sessions(@CurrentUser() user: AuthenticatedUser): Promise<SessionResponse[]> {
    return this.authService.getSessions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-verification-email')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send email verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already verified' })
  sendVerificationEmail(@CurrentUser() user: AuthenticatedUser): Promise<{ success: true }> {
    return this.authService.sendVerificationEmail(user.id);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'If email exists, reset email sent' })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ success: true }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request): Promise<{ success: true }> {
    return this.authService.resetPassword(dto, request);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  verifyEmail(@Body() dto: VerifyEmailDto, @Req() request: Request): Promise<{ success: true }> {
    return this.authService.verifyEmail(dto, request);
  }
}
