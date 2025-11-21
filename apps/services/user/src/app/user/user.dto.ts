import {
  IsEmail,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdatePasswordDto {
  @IsString()
  hashedPassword!: string;

  @IsOptional()
  @IsString()
  currentHashedPassword?: string;
}
