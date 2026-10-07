import { Controller, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN')
export class AdminController {
  public constructor(private readonly prisma: PrismaService) {}

  @Post('stations/:id/approve')
  public async approveStation(@Param('id') id: string) {
    const station = await this.prisma.station.findUnique({ where: { id } });
    if (!station) throw new NotFoundException({ code: 'STATION_NOT_FOUND', message: 'The station was not found.' });
    return this.prisma.station.update({ where: { id }, data: { approvalStatus: 'APPROVED' } });
  }
}
