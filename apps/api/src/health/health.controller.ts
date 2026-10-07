import { Controller, Get, HttpException, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InfrastructureHealthService } from './infrastructure-health.service';

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  public constructor(private readonly infrastructureHealth: InfrastructureHealthService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  public live(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for PostgreSQL and Redis' })
  public async ready(): Promise<{ status: 'ok'; timestamp: string }> {
    const result = await this.infrastructureHealth.check();
    if (!result.ready) {
      throw new HttpException(
        { code: 'DEPENDENCY_UNAVAILABLE', message: 'A required dependency is unavailable.', details: result },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

