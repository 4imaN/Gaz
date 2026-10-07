import { IsIn, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsIn(['en', 'am'])
  public preferredLanguage?: 'en' | 'am';
}
