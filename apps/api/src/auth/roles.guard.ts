import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;
    const user = context.switchToHttp().getRequest<Request>().user as AuthenticatedUser | undefined;
    if (user?.roles.some((role) => requiredRoles.includes(role))) return true;
    throw new ForbiddenException({ code: 'ROLE_FORBIDDEN', message: 'Your role cannot perform this action.' });
  }
}

