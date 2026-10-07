import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException({ code: 'AUTHENTICATION_REQUIRED', message: 'A bearer token is required.' });
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: { select: { role: true } } },
      });
      if (!user || user.status !== UserStatus.ACTIVE) throw new Error('Account unavailable');
      request.user = {
        id: user.id,
        phoneNumber: user.phoneNumber,
        roles: user.roles.map(({ role }) => role),
      };
      return true;
    } catch {
      throw new UnauthorizedException({ code: 'AUTHENTICATION_INVALID', message: 'The bearer token is invalid or expired.' });
    }
  }
}
