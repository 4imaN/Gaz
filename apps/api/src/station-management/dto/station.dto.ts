import { IsIn, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateStationDto {
  @IsString() @Length(2, 160) name!: string;
  @IsString() @Length(2, 500) address!: string;
  @IsLatitude() latitude!: number;
  @IsLongitude() longitude!: number;
  @IsOptional() @IsLatitude() entranceLatitude?: number;
  @IsOptional() @IsLongitude() entranceLongitude?: number;
  @IsOptional() @IsString() @Length(1, 64) timezone?: string;
}

export class CreatePumpDto {
  @IsString() @Length(1, 80) name!: string;
  @IsInt() @Min(1) capacity!: number;
  @IsString({ each: true }) fuelTypeIds!: string[];
}

export class InventoryAdjustmentDto {
  @IsString() fuelTypeId!: string;
  @Min(0.001) quantityLitres!: number;
  @IsOptional() @IsString() note?: string;
}

export class InventoryCorrectionDto extends InventoryAdjustmentDto {
  @IsIn([-1, 1]) direction!: -1 | 1;
}
