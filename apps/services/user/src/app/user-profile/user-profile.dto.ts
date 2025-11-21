import { IsOptional, IsString, IsObject, IsUrl, IsEnum } from 'class-validator';
import { Sex } from '@helix-ai/db/enums/sex.enum';
import { Gender } from '@helix-ai/db/enums/gender.enum';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  handle?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsObject()
  links?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;
}
