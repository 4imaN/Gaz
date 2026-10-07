import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryStatus, type InventoryTransactionType, type PumpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePumpDto, CreateStationDto, InventoryAdjustmentDto, InventoryCorrectionDto } from './dto/station.dto';

@Injectable()
export class StationManagementService {
  public constructor(private readonly prisma: PrismaService) {}

  public async createStation(ownerUserId: string, dto: CreateStationDto) {
    return this.prisma.station.create({ data: { ownerUserId, ...dto } });
  }

  public async stationForManager(userId: string) {
    const station = await this.prisma.station.findFirst({ where: { ownerUserId: userId } });
    if (!station) throw new NotFoundException({ code: 'STATION_NOT_FOUND', message: 'No managed station was found.' });
    return station;
  }

  public async createPump(userId: string, dto: CreatePumpDto) {
    const station = await this.stationForManager(userId);
    const fuelTypes = await this.prisma.fuelType.findMany({ where: { id: { in: dto.fuelTypeIds }, isActive: true } });
    if (!dto.fuelTypeIds.length || fuelTypes.length !== new Set(dto.fuelTypeIds).size) {
      throw new ConflictException({ code: 'FUEL_TYPE_INVALID', message: 'Select active fuel types for the pump.' });
    }
    return this.prisma.pump.create({
      data: { stationId: station.id, name: dto.name.trim(), capacity: dto.capacity, fuelTypes: { create: fuelTypes.map((fuel) => ({ fuelTypeId: fuel.id })) } },
      include: { fuelTypes: { include: { fuelType: true } } },
    });
  }

  public async listPumps(userId: string) {
    const station = await this.stationForManager(userId);
    return this.prisma.pump.findMany({ where: { stationId: station.id }, include: { fuelTypes: { include: { fuelType: true } } } });
  }

  public async updatePumpStatus(userId: string, pumpId: string, status: PumpStatus) {
    const station = await this.stationForManager(userId);
    const pump = await this.prisma.pump.findFirst({ where: { id: pumpId, stationId: station.id } });
    if (!pump) throw new NotFoundException({ code: 'PUMP_NOT_FOUND', message: 'The pump was not found.' });
    return this.prisma.pump.update({ where: { id: pumpId }, data: { status } });
  }

  public async listInventory(userId: string) {
    const station = await this.stationForManager(userId);
    return this.prisma.fuelInventory.findMany({ where: { stationId: station.id }, include: { fuelType: true } });
  }

  public async adjustInventory(userId: string, dto: InventoryAdjustmentDto | InventoryCorrectionDto, type: InventoryTransactionType, multiplier = 1) {
    const station = await this.stationForManager(userId);
    const delta = dto.quantityLitres * multiplier;
    return this.prisma.$transaction(async (transaction) => {
      const inventory = await transaction.fuelInventory.findUnique({ where: { stationId_fuelTypeId: { stationId: station.id, fuelTypeId: dto.fuelTypeId } } });
      const current = inventory?.estimatedQuantityLitres.toNumber() ?? 0;
      const next = current + delta;
      if (next < 0) throw new ConflictException({ code: 'INVENTORY_NEGATIVE', message: 'Inventory cannot become negative.' });
      const threshold = inventory?.lowStockThresholdLitres.toNumber() ?? 0;
      const status = next === 0 ? InventoryStatus.OUT_OF_STOCK : next <= threshold ? InventoryStatus.LOW : InventoryStatus.AVAILABLE;
      const updated = await transaction.fuelInventory.upsert({
        where: { stationId_fuelTypeId: { stationId: station.id, fuelTypeId: dto.fuelTypeId } },
        create: { stationId: station.id, fuelTypeId: dto.fuelTypeId, estimatedQuantityLitres: next, status },
        update: { estimatedQuantityLitres: next, status },
      });
      await transaction.inventoryTransaction.create({ data: { stationId: station.id, fuelTypeId: dto.fuelTypeId, transactionType: type, quantityLitres: delta, recordedBy: userId, note: dto.note } });
      return updated;
    });
  }
}
