import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Pool } from 'pg';

@Injectable()
export class InfrastructureHealthService implements OnModuleDestroy {
  private readonly logger = new Logger(InfrastructureHealthService.name);
  private readonly postgres: Pool;
  private readonly redis: Redis;

  public constructor(config: ConfigService) {
    this.postgres = new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') });
    this.redis = new Redis(config.getOrThrow<string>('REDIS_URL'), { lazyConnect: true, maxRetriesPerRequest: 1 });
  }

  public async check(): Promise<{ ready: boolean; postgres: boolean; redis: boolean; errors?: Record<string, string> }> {
    const [postgres, redis] = await Promise.all([this.checkPostgres(), this.checkRedis()]);
    const errors = Object.fromEntries(
      Object.entries({ postgres: postgres.error, redis: redis.error }).filter(([, error]) => error),
    ) as Record<string, string>;
    return {
      ready: postgres.ok && redis.ok,
      postgres: postgres.ok,
      redis: redis.ok,
      ...(process.env.NODE_ENV !== 'production' && Object.keys(errors).length ? { errors } : {}),
    };
  }

  private async checkPostgres(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.postgres.query('SELECT 1');
      return { ok: true };
    } catch (error) {
      this.logger.warn(`PostgreSQL readiness check failed: ${error instanceof Error ? error.message : String(error)}`);
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async checkRedis(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.redis.ping();
      return { ok: true };
    } catch (error) {
      this.logger.warn(`Redis readiness check failed: ${error instanceof Error ? error.message : String(error)}`);
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.postgres.end();
    this.redis.disconnect();
  }
}
