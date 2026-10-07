import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { PumpStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePumpDto, CreateStationDto, InventoryAdjustmentDto, InventoryCorrectionDto } from './dto/station.dto';
import { StationManagementService } from './station-management.service';

@ApiTags('station-management')
@ApiBearerAuth()
@Controller({ path: 'station-management', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STATION_MANAGER')
export class StationManagementController {
  public constructor(private readonly stations: StationManagementService) {}

  @Post('stations') createStation(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateStationDto) { return this.stations.createStation(user.id, dto); }
  @Get('station') station(@CurrentUser() user: AuthenticatedUser) { return this.stations.stationForManager(user.id); }
  @Get('pumps') pumps(@CurrentUser() user: AuthenticatedUser) { return this.stations.listPumps(user.id); }
  @Post('pumps') createPump(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePumpDto) { return this.stations.createPump(user.id, dto); }
  @Patch('pumps/:id/status') updatePump(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('status') status: PumpStatus) { return this.stations.updatePumpStatus(user.id, id, status); }
  @Get('inventory') inventory(@CurrentUser() user: AuthenticatedUser) { return this.stations.listInventory(user.id); }
  @Post('inventory/initial') initial(@CurrentUser() user: AuthenticatedUser, @Body() dto: InventoryAdjustmentDto) { return this.stations.adjustInventory(user.id, dto, 'INITIAL_STOCK'); }
  @Post('inventory/refill') refill(@CurrentUser() user: AuthenticatedUser, @Body() dto: InventoryAdjustmentDto) { return this.stations.adjustInventory(user.id, dto, 'REFILL'); }
  @Post('inventory/correction') correction(@CurrentUser() user: AuthenticatedUser, @Body() dto: InventoryCorrectionDto) { return this.stations.adjustInventory(user.id, dto, 'CORRECTION', dto.direction); }
}
