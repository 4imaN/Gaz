import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StationManagementController } from './station-management.controller';
import { StationManagementService } from './station-management.service';

@Module({ imports: [AuthModule], controllers: [StationManagementController], providers: [StationManagementService] })
export class StationManagementModule {}
