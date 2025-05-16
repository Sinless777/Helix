// apis/auth/src/user/dto/createUser.dto.ts

import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    { message: 'Password too weak. Must include uppercase, lowercase, number, and special character.' })
  password: string;
}
