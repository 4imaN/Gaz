import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type VehicleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { normalizePlateNumber } from './plate-normalizer';

@Injectable()
export class VehiclesService {
  public constructor(private readonly prisma: PrismaService) {}

  public list(userId: string) {
    return this.prisma.vehicle.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  public async create(userId: string, dto: CreateVehicleDto) {
    try {
      return await this.prisma.vehicle.create({
        data: {
          userId,
          plateNumber: dto.plateNumber.trim(),
          plateNormalized: normalizePlateNumber(dto.plateNumber),
          vehicleType: dto.vehicleType as VehicleType,
          make: dto.make?.trim(),
          model: dto.model?.trim(),
          color: dto.color?.trim(),
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.rethrowPlateConflict(error);
    }
  }

  public async get(userId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id, userId } });
    if (!vehicle) throw this.notFound();
    return vehicle;
  }

  public async update(userId: string, id: string, dto: UpdateVehicleDto) {
    await this.get(userId, id);
    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: {
          ...(dto.plateNumber === undefined
            ? {}
            : { plateNumber: dto.plateNumber.trim(), plateNormalized: normalizePlateNumber(dto.plateNumber) }),
          ...(dto.vehicleType === undefined ? {} : { vehicleType: dto.vehicleType as VehicleType }),
          ...(dto.make === undefined ? {} : { make: dto.make.trim() }),
          ...(dto.model === undefined ? {} : { model: dto.model.trim() }),
          ...(dto.color === undefined ? {} : { color: dto.color.trim() }),
          ...(dto.isActive === undefined ? {} : { isActive: dto.isActive }),
        },
      });
    } catch (error) {
      this.rethrowPlateConflict(error);
    }
  }

  public async remove(userId: string, id: string): Promise<void> {
    await this.get(userId, id);
    await this.prisma.vehicle.update({ where: { id }, data: { isActive: false } });
  }

  private rethrowPlateConflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException({ code: 'VEHICLE_PLATE_EXISTS', message: 'This licence plate is already registered.' });
    }
    throw error;
  }

  private notFound(): NotFoundException {
    return new NotFoundException({ code: 'VEHICLE_NOT_FOUND', message: 'The vehicle was not found.' });
  }
}
