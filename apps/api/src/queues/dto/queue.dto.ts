import { IsOptional, IsString, Length } from 'class-validator';

export class JoinQueueDto {
  @IsString() vehicleId!: string;
  @IsString() stationId!: string;
  @IsString() fuelTypeId!: string;
}

export class CancelQueueDto {
  @IsOptional() @IsString() @Length(1, 500) reason?: string;
}
