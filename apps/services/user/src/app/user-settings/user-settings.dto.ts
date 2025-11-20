import { IsOptional, IsObject } from 'class-validator';

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
}
