import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InventoryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerService {
  public constructor(private readonly prisma: PrismaService) {}

  private async stationForWorker(userId: string) {
    const assignment = await this.prisma.stationWorker.findFirst({ where: { userId, isActive: true } });
    if (!assignment) throw new NotFoundException({ code: 'WORKER_STATION_NOT_FOUND', message: 'No active station assignment was found.' });
    return assignment.stationId;
  }

  public async verifyArrival(userId: string, queueEntryId: string) {
    const stationId = await this.stationForWorker(userId);
    const entry = await this.prisma.queueEntry.findFirst({ where: { id: queueEntryId, stationId, status: { in: ['WAITING', 'PREPARE_TO_LEAVE', 'TRAVELLING', 'NEAR_STATION', 'SKIPPED'] } } });
    if (!entry) throw new NotFoundException({ code: 'QUEUE_ENTRY_NOT_FOUND', message: 'No eligible queue entry was found at this station.' });
    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.queueEntry.update({ where: { id: entry.id }, data: { status: 'CHECKED_IN', checkedInAt: new Date() } });
      await transaction.queueStatusHistory.create({ data: { queueEntryId: entry.id, fromStatus: entry.status, toStatus: 'CHECKED_IN', actorId: userId } });
      return updated;
    });
  }

  public async assignPump(userId: string, queueEntryId: string, pumpId: string) {
    const stationId = await this.stationForWorker(userId);
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${pumpId}))`);
      const [entry, pump] = await Promise.all([
        transaction.queueEntry.findFirst({ where: { id: queueEntryId, stationId, status: 'CHECKED_IN' } }),
        transaction.pump.findFirst({ where: { id: pumpId, stationId, status: 'AVAILABLE' }, include: { fuelTypes: true } }),
      ]);
      if (!entry) throw new NotFoundException({ code: 'QUEUE_ENTRY_NOT_READY', message: 'The queue entry is not checked in.' });
      if (!pump || !pump.fuelTypes.some((type) => type.fuelTypeId === entry.fuelTypeId)) {
        throw new ConflictException({ code: 'PUMP_INCOMPATIBLE', message: 'The selected pump is unavailable or incompatible.' });
      }
      const activeAssignments = await transaction.pumpAssignment.count({ where: { pumpId, status: { in: ['RESERVED', 'ARRIVED', 'IN_SERVICE'] } } });
      if (activeAssignments >= pump.capacity) throw new ConflictException({ code: 'PUMP_CAPACITY_REACHED', message: 'No pump capacity slot is available.' });
      const assignment = await transaction.pumpAssignment.create({ data: { queueEntryId: entry.id, pumpId, workerId: userId } });
      await transaction.queueEntry.update({ where: { id: entry.id }, data: { status: 'ASSIGNED_TO_PUMP' } });
      await transaction.queueStatusHistory.create({ data: { queueEntryId: entry.id, fromStatus: 'CHECKED_IN', toStatus: 'ASSIGNED_TO_PUMP', actorId: userId } });
      return assignment;
    });
  }

  public async startService(userId: string, queueEntryId: string) {
    const stationId = await this.stationForWorker(userId);
    return this.prisma.$transaction(async (transaction) => {
      const assignment = await transaction.pumpAssignment.findFirst({ where: { queueEntryId, workerId: userId, status: { in: ['RESERVED', 'ARRIVED'] }, queueEntry: { stationId } } });
      if (!assignment) throw new NotFoundException({ code: 'ASSIGNMENT_NOT_FOUND', message: 'No serviceable pump assignment was found.' });
      await transaction.pumpAssignment.update({ where: { id: assignment.id }, data: { status: 'IN_SERVICE', serviceStartedAt: new Date() } });
      const entry = await transaction.queueEntry.update({ where: { id: queueEntryId }, data: { status: 'FUELING' } });
      await transaction.queueStatusHistory.create({ data: { queueEntryId, fromStatus: 'ASSIGNED_TO_PUMP', toStatus: 'FUELING', actorId: userId } });
      return entry;
    });
  }

  public async completeService(userId: string, queueEntryId: string, quantityLitres: number, unitPrice?: number) {
    const stationId = await this.stationForWorker(userId);
    const existing = await this.prisma.fuelTransaction.findUnique({ where: { queueEntryId } });
    if (existing) return existing;
    return this.prisma.$transaction(async (transaction) => {
      const assignment = await transaction.pumpAssignment.findFirst({ where: { queueEntryId, workerId: userId, status: 'IN_SERVICE', queueEntry: { stationId } }, include: { queueEntry: true } });
      if (!assignment) throw new NotFoundException({ code: 'ASSIGNMENT_NOT_FOUND', message: 'No active service assignment was found.' });
      await transaction.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${assignment.pumpId}))`);
      const inventory = await transaction.fuelInventory.findUnique({ where: { stationId_fuelTypeId: { stationId, fuelTypeId: assignment.queueEntry.fuelTypeId } } });
      if (!inventory || inventory.estimatedQuantityLitres.lt(quantityLitres)) throw new ConflictException({ code: 'INVENTORY_INSUFFICIENT', message: 'Estimated inventory is insufficient for this sale.' });
      const remaining = inventory.estimatedQuantityLitres.toNumber() - quantityLitres;
      const status = remaining === 0 ? InventoryStatus.OUT_OF_STOCK : remaining <= inventory.lowStockThresholdLitres.toNumber() ? InventoryStatus.LOW : InventoryStatus.AVAILABLE;
      const completedAt = new Date();
      const sale = await transaction.fuelTransaction.create({ data: { queueEntryId, stationId, pumpId: assignment.pumpId, workerId: userId, vehicleId: assignment.queueEntry.vehicleId, fuelTypeId: assignment.queueEntry.fuelTypeId, quantityLitres, unitPrice, totalValue: unitPrice === undefined ? undefined : unitPrice * quantityLitres, startedAt: assignment.serviceStartedAt, completedAt } });
      await transaction.inventoryTransaction.create({ data: { stationId, fuelTypeId: assignment.queueEntry.fuelTypeId, transactionType: 'SALE', quantityLitres: -quantityLitres, referenceId: sale.id, recordedBy: userId } });
      await transaction.fuelInventory.update({ where: { id: inventory.id }, data: { estimatedQuantityLitres: remaining, status } });
      await transaction.pumpAssignment.update({ where: { id: assignment.id }, data: { status: 'COMPLETED', serviceCompletedAt: completedAt } });
      await transaction.queueEntry.update({ where: { id: queueEntryId }, data: { status: 'COMPLETED', completedAt } });
      await transaction.queueStatusHistory.create({ data: { queueEntryId, fromStatus: 'FUELING', toStatus: 'COMPLETED', actorId: userId } });
      return sale;
    });
  }
}
