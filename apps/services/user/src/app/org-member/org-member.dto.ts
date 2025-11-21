// apps/services/user/src/app/org-member/org-member.dto.ts

import {
  IsString,
  IsUUID,
  IsObject,
  IsOptional,
} from 'class-validator';

export class AddOrgMemberDto {
  @IsUUID()
  orgId!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}

export class UpdateOrgMemberDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
