import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller({ path: 'vehicles', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DRIVER')
export class VehiclesController {
  public constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  public list(@CurrentUser() user: AuthenticatedUser) {
    return this.vehicles.list(user.id);
  }

  @Post()
  public create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVehicleDto) {
    return this.vehicles.create(user.id, dto);
  }

  @Get(':id')
  public get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.vehicles.get(user.id, id);
  }

  @Patch(':id')
  public update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  public async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    await this.vehicles.remove(user.id, id);
  }
}
