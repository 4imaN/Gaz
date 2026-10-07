import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService, type AuthTokens } from './auth.service';
import type { AuthenticatedUser } from './auth.types';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  public requestOtp(@Body() dto: RequestOtpDto): Promise<{ expiresAt: Date; developmentCode?: string }> {
    return this.authService.requestOtp(dto.phoneNumber);
  }

  @Post('verify-otp')
  public verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokens> {
    return this.authService.verifyOtp(dto.phoneNumber, dto.code);
  }

  @Post('refresh')
  public refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  public async logout(@CurrentUser() user: AuthenticatedUser, @Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  public me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return this.authService.me(user.id);
  }
}
