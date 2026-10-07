import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnvironment } from '@fuel-queue/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueuesModule } from './queues/queues.module';
import { RoutingModule } from './routing/routing.module';
import { StationManagementModule } from './station-management/station-management.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { WorkerModule } from './worker/worker.module';

const localEnvironmentPath = resolve(process.cwd(), '../../.env');

if (process.env.NODE_ENV !== 'production' && existsSync(localEnvironmentPath)) {
  const localValues = Object.fromEntries(
    readFileSync(localEnvironmentPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
  process.env.DATABASE_URL = localValues.DATABASE_URL ?? process.env.DATABASE_URL;
  process.env.REDIS_URL = localValues.REDIS_URL ?? process.env.REDIS_URL;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: resolve(process.cwd(), '../../.env'),
      validate: parseEnvironment,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: (request) => request.headers['x-request-id']?.toString() ?? randomUUID(),
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        customProps: (request) => ({ requestId: request.headers['x-request-id']?.toString() }),
      },
    }),
    PrismaModule,
    QueuesModule,
    RoutingModule,
    StationManagementModule,
    HealthModule,
    IdempotencyModule,
    AuthModule,
    AdminModule,
    UsersModule,
    VehiclesModule,
    WorkerModule,
  ],
})
export class AppModule {}
