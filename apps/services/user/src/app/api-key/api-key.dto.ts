// apps/services/user/src/app/api-key/api-key.dto.ts

import {
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  scopes!: string[];

  /**
   * If set, API key is owned by this user.
   */
  @IsOptional()
  @IsUUID()
  userId?: string;

  /**
   * If set, API key is owned by this org.
   */
  @IsOptional()
  @IsUUID()
  orgId?: string;

  /**
   * Whether to allow creating a key with *both* unset.
   * Default false → require either userId or orgId.
   */
  @IsOptional()
  @IsBoolean()
  allowUnscoped?: boolean;
}

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  scopes?: string[];

  @IsOptional()
  @IsString()
  reason?: string;
}
