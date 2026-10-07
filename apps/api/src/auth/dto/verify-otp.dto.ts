import { IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/)
  public phoneNumber!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  public code!: string;
}

