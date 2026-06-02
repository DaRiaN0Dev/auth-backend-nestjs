import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  signUp(@Body() dto: SignUpDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('sign-in')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  signIn(@Body() dto: SignInDto, @Req() request: Request): Promise<AuthResponse> {
    return this.authService.login(dto, request);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request): Promise<AuthResponse> {
    const refreshToken = extractRefreshToken(request, dto.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.refresh(refreshToken, request);
  }

  @Post('logout')
  logout(@Body() dto: LogoutDto, @Req() request: Request): Promise<{ success: true }> {
    const refreshToken = extractRefreshToken(request, dto.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.logout(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<{ success: true }> {
    return this.authService.logoutAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<SafeUser> {
    return this.authService.me(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  sessions(@CurrentUser() user: AuthenticatedUser): Promise<SessionResponse[]> {
    return this.authService.getSessions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-verification-email')
  sendVerificationEmail(@CurrentUser() user: AuthenticatedUser): Promise<{ success: true }> {
    return this.authService.sendVerificationEmail(user.id);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ success: true }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ success: true }> {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ success: true }> {
    return this.authService.verifyEmail(dto);
  }
}
