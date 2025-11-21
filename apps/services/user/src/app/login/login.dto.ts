// apps/services/user/src/app/login/login.dto.ts
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  /**
   * Hash of the password, produced client-side using
   * the same algorithm as in the signup flow.
   */
  @IsString()
  hashedPassword!: string;

  /**
   * Optional TTL (ms) for the created session.
   * Defaults to 7 days if not provided.
   */
  @IsOptional()
  @IsInt()
  @Min(60_000)
  sessionTtlMs?: number;
}

export class LoginResponseDto {
  userId!: string;
  sessionToken!: string;
  expires!: string;
}
