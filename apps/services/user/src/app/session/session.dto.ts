import { IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  userId!: string;

  @IsString()
  sessionToken!: string;

  @IsDateString()
  expires!: string;
}

export class ValidateSessionDto {
  @IsString()
  sessionToken!: string;
}

export class RevokeSessionDto {
  @IsString()
  sessionToken!: string;
}
