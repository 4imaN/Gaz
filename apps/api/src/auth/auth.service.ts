import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus, type Prisma, type UserRole } from '@prisma/client';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser, JwtPayload } from './auth.types';

const OTP_TTL_MS = 5 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DEVELOPMENT_OTP = '123456';

type UserWithRoles = Prisma.UserGetPayload<{ include: { roles: true } }>;

@Injectable()
export class AuthService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async requestOtp(phoneNumber: string): Promise<{ expiresAt: Date; developmentCode?: string }> {
    const user = await this.prisma.user.upsert({
      where: { phoneNumber },
      create: { phoneNumber, roles: { create: { role: 'DRIVER' } } },
      update: {},
    });
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.prisma.$transaction([
      this.prisma.authOtpChallenge.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.authOtpChallenge.create({
        data: { userId: user.id, codeHash: this.hashOtp(phoneNumber, DEVELOPMENT_OTP), expiresAt },
      }),
    ]);
    return {
      expiresAt,
      ...(this.config.get<string>('NODE_ENV') !== 'production' ? { developmentCode: DEVELOPMENT_OTP } : {}),
    };
  }

  public async verifyOtp(phoneNumber: string, code: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      include: { roles: true },
    });
    if (!user) throw this.invalidOtp();
    const challenge = await this.prisma.authOtpChallenge.findFirst({
      where: { userId: user.id, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge || !this.matchesHash(challenge.codeHash, this.hashOtp(phoneNumber, code))) {
      throw this.invalidOtp();
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ code: 'ACCOUNT_UNAVAILABLE', message: 'This account cannot sign in.' });
    }
    const consumed = await this.prisma.authOtpChallenge.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) throw this.invalidOtp();
    const verifiedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerifiedAt: new Date() },
      include: { roles: true },
    });
    return this.createSession(verifiedUser);
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    const session = await this.prisma.authSession.findFirst({
      where: { refreshTokenHash: this.hashValue(refreshToken), revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { include: { roles: true } } },
    });
    if (!session || session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ code: 'REFRESH_TOKEN_INVALID', message: 'The refresh token is invalid or expired.' });
    }
    const next = await this.buildTokens(session.user);
    await this.prisma.$transaction(async (transaction) => {
      const revoked = await transaction.authSession.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) {
        throw new UnauthorizedException({ code: 'REFRESH_TOKEN_INVALID', message: 'The refresh token is invalid or expired.' });
      }
      await transaction.authSession.create({
        data: {
          userId: session.userId,
          refreshTokenHash: this.hashValue(next.refreshToken),
          expiresAt: next.refreshExpiresAt,
        },
      });
    });
    return next;
  }

  public async logout(userId: string, refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    await this.prisma.authSession.updateMany({
      where: { userId, refreshTokenHash: this.hashValue(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  public async me(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ code: 'ACCOUNT_UNAVAILABLE', message: 'This account is unavailable.' });
    }
    return this.toAuthenticatedUser(user);
  }

  private async createSession(user: UserWithRoles): Promise<AuthTokens> {
    const tokens = await this.buildTokens(user);
    await this.prisma.authSession.create({
      data: { userId: user.id, refreshTokenHash: this.hashValue(tokens.refreshToken), expiresAt: tokens.refreshExpiresAt },
    });
    return tokens;
  }

  private async buildTokens(user: UserWithRoles): Promise<AuthTokens> {
    const principal = this.toAuthenticatedUser(user);
    const payload: JwtPayload = { sub: principal.id, phoneNumber: principal.phoneNumber, roles: principal.roles };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      refreshToken: randomBytes(48).toString('base64url'),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    };
  }

  private toAuthenticatedUser(user: UserWithRoles): AuthenticatedUser {
    return { id: user.id, phoneNumber: user.phoneNumber, roles: user.roles.map(({ role }) => role as UserRole) };
  }

  private hashOtp(phoneNumber: string, code: string): string {
    return this.hashValue(`${phoneNumber}:${code}`);
  }

  private hashValue(value: string): string {
    return createHash('sha256')
      .update(this.config.getOrThrow<string>('OTP_HASH_SECRET'))
      .update(':')
      .update(value)
      .digest('hex');
  }

  private matchesHash(actual: string, expected: string): boolean {
    return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  }

  private invalidOtp(): UnauthorizedException {
    return new UnauthorizedException({ code: 'OTP_INVALID', message: 'The verification code is invalid or expired.' });
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}
