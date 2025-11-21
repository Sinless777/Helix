import {
  IsString,
  IsUUID,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class LinkAccountDto {
  // User IDs may be UUIDs or provider-issued strings (e.g., Google sub).
  userId!: string;

  @IsString()
  provider!: string;

  @IsString()
  accountId!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsUrl()
  managementUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUrl()
  managementUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
