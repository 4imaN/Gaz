import { NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  it('does not expose a vehicle owned by another user', async () => {
    const prisma = { vehicle: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new VehiclesService(prisma as never);

    await expect(service.get('driver-a', 'vehicle-b')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({ where: { id: 'vehicle-b', userId: 'driver-a' } });
  });

  it('persists a normalized plate number when creating a vehicle', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'vehicle-1' });
    const service = new VehiclesService({ vehicle: { create } } as never);

    await service.create('driver-a', { plateNumber: ' aa  123 ', vehicleType: 'CAR' });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ plateNormalized: 'AA 123', userId: 'driver-a' }) }),
    );
  });
});
