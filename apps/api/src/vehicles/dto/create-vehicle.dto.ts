import { IsBoolean, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

export const VEHICLE_TYPES = ['CAR', 'MOTORCYCLE', 'TAXI', 'MINIBUS', 'BUS', 'TRUCK', 'OTHER'] as const;

export class CreateVehicleDto {
  @IsString()
  @Length(2, 64)
  @Matches(/\S/)
  public plateNumber!: string;

  @IsIn(VEHICLE_TYPES)
  public vehicleType!: (typeof VEHICLE_TYPES)[number];

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public make?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public model?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  public color?: string;

  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
