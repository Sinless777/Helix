// apps/services/user/src/app/org-settings/org-settings.dto.ts

import { IsOptional, IsObject } from 'class-validator';

export class UpdateOrgSettingsDto {
  @IsOptional()
  @IsObject()
  branding?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  security?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  defaults?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  billingPrefs?: Record<string, unknown>;
}
