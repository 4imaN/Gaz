import { BadRequestException, Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CancelQueueDto, JoinQueueDto } from './dto/queue.dto';
import { QueuesService } from './queues.service';

@ApiTags('queues')
@ApiBearerAuth()
@Controller({ path: 'queues', version: '1' })
@UseGuards(JwtAuthGuard)
export class QueuesController {
  public constructor(private readonly queues: QueuesService) {}
  @Post('join')
  async join(@CurrentUser() user: AuthenticatedUser, @Body() dto: JoinQueueDto, @Headers('idempotency-key') key?: string) {
    if (!key || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
      throw new BadRequestException({ code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'A valid Idempotency-Key header is required.' });
    }
    return this.queues.join(user.id, dto, key);
  }
  @Get('active') active(@CurrentUser() user: AuthenticatedUser) { return this.queues.active(user.id); }
  @Post(':id/cancel') cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CancelQueueDto) { return this.queues.cancel(user.id, id, dto); }
}
