import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { InfrastructureHealthService } from './infrastructure-health.service';

@Module({
  controllers: [HealthController],
  providers: [InfrastructureHealthService],
})
export class HealthModule {}

