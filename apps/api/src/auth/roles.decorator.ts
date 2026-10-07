import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROLES_KEY = 'fuel-queue:roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

