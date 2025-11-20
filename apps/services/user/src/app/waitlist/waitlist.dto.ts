import {
  IsEmail,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateWaitlistDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  refCode?: string;

  @IsOptional()
  @IsString()
  cohort?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateWaitlistStatusDto {
  @IsString()
  status!: string;
}
