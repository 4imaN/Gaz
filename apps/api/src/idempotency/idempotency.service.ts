import { ConflictException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdempotencyService {
  public constructor(private readonly prisma: PrismaService) {}

  public async replay<T>(userId: string, route: string, key: string, payload: unknown): Promise<T | null> {
    const record = await this.prisma.idempotencyRecord.findUnique({ where: { userId_route_idempotencyKey: { userId, route, idempotencyKey: key } } });
    if (!record) return null;
    if (record.requestHash !== this.hash(payload)) {
      throw new ConflictException({ code: 'IDEMPOTENCY_KEY_REUSED', message: 'This idempotency key was used with a different request.' });
    }
    return record.responseBody as T | null;
  }

  public async store(userId: string, route: string, key: string, payload: unknown, response: unknown): Promise<void> {
    await this.prisma.idempotencyRecord.create({
      data: { userId, route, idempotencyKey: key, requestHash: this.hash(payload), responseStatus: 200, responseBody: response as Prisma.InputJsonValue, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
  }

  private hash(payload: unknown): string {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
}
