import type { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  phoneNumber: string;
  roles: UserRole[];
}

export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  roles: UserRole[];
}

