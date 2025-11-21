import { IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsObject()
  notifications?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  privacy?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  accessibility?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  product?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  emailAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  hideProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;

  @IsOptional()
  @IsBoolean()
  betaFeatures?: boolean;
}
