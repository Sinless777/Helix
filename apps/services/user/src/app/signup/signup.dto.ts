import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  hashedPassword!: string;

  @IsString()
  displayName!: string;

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

  /**
   * Whether to create a verification token as part of signup.
   * Defaults to true.
   */
  @IsOptional()
  @IsBoolean()
  createVerificationToken?: boolean;
}

export class CheckEmailResponseDto {
  available!: boolean;
}
