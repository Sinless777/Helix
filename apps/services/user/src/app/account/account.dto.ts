import {
  IsString,
  IsUUID,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class LinkAccountDto {
  @IsUUID()
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
