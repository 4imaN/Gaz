import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AssignPumpDto {
  @IsString() pumpId!: string;
}

export class CompleteServiceDto {
  @IsNumber() @Min(0.001) quantityLitres!: number;
  @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
}
