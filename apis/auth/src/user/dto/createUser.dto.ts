import { IsEmail, IsString, MinLength, Matches } from 'class-validator'
import { User } from '../user.entity'

/**
 * DTO for creating a new user.
 * Mirrors a partial structure of the User entity.
 *
 * @example
 * const dto = new CreateUserDto('user@example.com', 'Str0ngP@ss!')
 */
export class CreateUserDto implements Pick<User, 'email'> {
  /**
   * Constructs a new CreateUserDto instance.
   *
   * @param email - The user's email address
   * @param password - The user's plain-text password
   */
  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }

  /**
   * The user's email address.
   * Must be a valid email format.
   */
  @IsEmail({}, { message: 'Invalid email format' })
  email: string

  /**
   * The user's password.
   * Must be at least 8 characters and include:
   * - One uppercase letter
   * - One lowercase letter
   * - One number
   * - One special character
   */
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password too weak. Must include uppercase, lowercase, number, and special character.',
  })
  password: string
}
