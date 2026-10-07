import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  public constructor(private readonly prisma: PrismaService) {}

  public async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { select: { role: true } } },
    });
    if (!user) throw new UnauthorizedException({ code: 'ACCOUNT_UNAVAILABLE', message: 'This account is unavailable.' });
    return { ...user, roles: user.roles.map(({ role }) => role) };
  }

  public async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...(dto.preferredLanguage === undefined ? {} : { preferredLanguage: dto.preferredLanguage }) },
      include: { roles: { select: { role: true } } },
    });
    return { ...user, roles: user.roles.map(({ role }) => role) };
  }
}
