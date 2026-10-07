import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AssignPumpDto, CompleteServiceDto } from './dto/worker.dto';
import { WorkerService } from './worker.service';

@ApiTags('worker')
@ApiBearerAuth()
@Controller({ path: 'worker', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('WORKER')
export class WorkerController {
  public constructor(private readonly worker: WorkerService) {}
  @Post('queue/:id/verify') verify(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.worker.verifyArrival(user.id, id); }
  @Post('queue/:id/assign') assign(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: AssignPumpDto) { return this.worker.assignPump(user.id, id, dto.pumpId); }
  @Post('queue/:id/start-service') start(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.worker.startService(user.id, id); }
  @Post('queue/:id/complete-service') complete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CompleteServiceDto) { return this.worker.completeService(user.id, id, dto.quantityLitres, dto.unitPrice); }
}
