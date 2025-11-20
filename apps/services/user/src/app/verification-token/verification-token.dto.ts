import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateVerificationTokenDto {
  /**
   * Owning user id (must exist in app_user).
   */
  @IsUUID()
  userId!: string;

  /**
   * Logical identifier for this token (usually an email).
   * Should match User.email in most flows.
   */
  @IsEmail()
  identifier!: string;

  /**
   * Optional override for expiry duration in seconds.
   * Default: 15 minutes (900 seconds).
   */
  @IsOptional()
  @IsInt()
  @Min(60)
  expiresInSeconds?: number;
}

export class VerifyTokenDto {
  /**
   * Owning user id to scope the token lookup.
   */
  @IsUUID()
  userId!: string;

  /**
   * Identifier used when the token was created (usually email).
   */
  @IsEmail()
  identifier!: string;

  /**
   * Token value submitted by the caller.
   */
  @IsString()
  @IsNotEmpty()
  token!: string;
}
