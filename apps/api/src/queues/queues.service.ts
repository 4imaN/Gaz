import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QueueEntryStatus, StationApprovalStatus, StationOperatingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IdempotencyService } from '../idempotency/idempotency.service';
import type { CancelQueueDto, JoinQueueDto } from './dto/queue.dto';

const ACTIVE_STATUSES: QueueEntryStatus[] = ['WAITING', 'PREPARE_TO_LEAVE', 'TRAVELLING', 'NEAR_STATION', 'CHECKED_IN', 'SKIPPED', 'ASSIGNED_TO_PUMP', 'FUELING'];

@Injectable()
export class QueuesService {
  public constructor(private readonly prisma: PrismaService, private readonly idempotency: IdempotencyService) {}

  public async join(userId: string, dto: JoinQueueDto, idempotencyKey: string) {
    const replay = await this.idempotency.replay<unknown>(userId, '/queues/join', idempotencyKey, dto);
    if (replay) return replay;
    try {
      const entry = await this.prisma.$transaction(async (transaction) => {
        const vehicle = await transaction.vehicle.findFirst({ where: { id: dto.vehicleId, userId, isActive: true } });
        if (!vehicle) throw new NotFoundException({ code: 'VEHICLE_NOT_FOUND', message: 'Select an active vehicle you own.' });
        const station = await transaction.station.findUnique({ where: { id: dto.stationId } });
        if (!station || station.approvalStatus !== StationApprovalStatus.APPROVED || station.operatingStatus !== StationOperatingStatus.OPEN) {
          throw new ConflictException({ code: 'STATION_UNAVAILABLE', message: 'This station is not accepting queue entries.' });
        }
        const [inventory, compatiblePump] = await Promise.all([
          transaction.fuelInventory.findUnique({ where: { stationId_fuelTypeId: { stationId: station.id, fuelTypeId: dto.fuelTypeId } } }),
          transaction.pump.findFirst({ where: { stationId: station.id, status: 'AVAILABLE', fuelTypes: { some: { fuelTypeId: dto.fuelTypeId } } } }),
        ]);
        if (!inventory || inventory.status === 'OUT_OF_STOCK' || inventory.estimatedQuantityLitres.lte(0)) {
          throw new ConflictException({ code: 'FUEL_UNAVAILABLE', message: 'The requested fuel is unavailable.' });
        }
        if (!compatiblePump) throw new ConflictException({ code: 'PUMP_UNAVAILABLE', message: 'No compatible pump is currently available.' });
        const entry = await transaction.queueEntry.create({ data: { userId, vehicleId: vehicle.id, stationId: station.id, fuelTypeId: dto.fuelTypeId } });
        await transaction.queueStatusHistory.create({ data: { queueEntryId: entry.id, toStatus: 'WAITING', actorId: userId } });
        return entry;
      });
      await this.idempotency.store(userId, '/queues/join', idempotencyKey, dto, entry);
      return entry;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({ code: 'QUEUE_ALREADY_ACTIVE', message: 'The user already has an active queue entry.' });
      }
      throw error;
    }
  }

  public async active(userId: string) {
    const entry = await this.prisma.queueEntry.findFirst({ where: { userId, status: { in: ACTIVE_STATUSES } }, orderBy: { joinedAt: 'asc' } });
    if (!entry) return null;
    const vehiclesAhead = await this.prisma.queueEntry.count({ where: { stationId: entry.stationId, fuelTypeId: entry.fuelTypeId, status: { in: ACTIVE_STATUSES }, OR: [{ priorityScore: { gt: entry.priorityScore } }, { priorityScore: entry.priorityScore, joinedAt: { lt: entry.joinedAt } }] } });
    return { ...entry, vehiclesAhead, position: vehiclesAhead + 1 };
  }

  public async cancel(userId: string, id: string, dto: CancelQueueDto) {
    const entry = await this.prisma.queueEntry.findFirst({ where: { id, userId, status: { in: ACTIVE_STATUSES } } });
    if (!entry) throw new NotFoundException({ code: 'QUEUE_ENTRY_NOT_FOUND', message: 'No cancellable active queue entry was found.' });
    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.queueEntry.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: dto.reason } });
      await transaction.queueStatusHistory.create({ data: { queueEntryId: id, fromStatus: entry.status, toStatus: 'CANCELLED', actorId: userId, reason: dto.reason } });
      return updated;
    });
  }
}
