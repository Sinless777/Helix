// apps/services/user/src/app/org/org.dto.ts

import {
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateOrgDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  /**
   * Optional initial owner user id.
   * If provided, an OrgMember row with role "owner" will be created.
   */
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
