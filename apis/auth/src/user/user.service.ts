import { EntityManager } from '@mikro-orm/postgresql'
import { User } from './user.entity'
import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

/**
 * Service for managing User entities including creation,
 * validation, and database access methods.
 */
@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Creates a new user with the given email and password.
   *
   * @param email - User's email address
   * @param password - Raw password to be hashed
   * @returns {Promise<User>} The newly created user
   *
   * @throws {Error} If email or password is missing
   * @throws {Error} If user already exists
   */
  async create(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const existingUser = await this.em.findOne(User, { email })
    if (existingUser) {
      throw new Error('User already exists')
    }

    const user = new User()
    user.email = email
    user.passwordHash = await bcrypt.hash(password, 10)

    await this.em.persistAndFlush(user)
    return user
  }

  /**
   * Finds a user by their email.
   *
   * @param email - Email address to search
   * @returns {Promise<User | null>} The found user or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email })
  }

  /**
   * Finds a user by their ID.
   *
   * @param id - UUID of the user
   * @returns {Promise<User | null>} The found user or null
   */
  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id })
  }

  /**
   * Returns all users in the system.
   *
   * @returns {Promise<User[]>} Array of all users
   */
  async all(): Promise<User[]> {
    return this.em.find(User, {})
  }

  /**
   * Updates a user by ID with the given changes.
   *
   * @param id - User's UUID
   * @param updates - Partial set of user fields to update
   * @returns {Promise<User>} The updated user
   *
   * @throws {Error} If user is not found
   */
  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    Object.assign(user, updates)
    await this.em.persistAndFlush(user)
    return user
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - UUID of the user
   * @returns {Promise<void>}
   *
   * @throws {Error} If user is not found
   */
  async delete(id: string): Promise<void> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    await this.em.removeAndFlush(user)
  }

  /**
   * Validates a user's password.
   *
   * @param user - The user object
   * @param password - Raw password to compare
   * @returns {Promise<boolean>} True if valid, false if not
   *
   * @throws {Error} If no password hash is set
   */
  async checkPassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) {
      throw new Error('User has no password set')
    }
    return bcrypt.compare(password, user.passwordHash)
  }

  /**
   * Checks if an email exists in the system.
   *
   * @param email - Email to check
   * @returns {Promise<boolean>} True if found, false otherwise
   */
  async isValidEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return user !== null
  }

  /**
   * Validates password complexity.
   *
   * @param password - Raw password to validate
   * @returns {Promise<boolean>} True if valid, false otherwise
   *
   * @remarks
   * Requirements:
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   *
   * @example
   * await userService.isValidPassword('Abcd1234!')
   */
  async isValidPassword(password: string): Promise<boolean> {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  /**
   * Checks whether the given email is already used.
   *
   * @param email - Email to check
   * @returns {Promise<boolean>} True if taken, false otherwise
   */
  async isEmailInUse(email: string): Promise<boolean> {
    return this.isValidEmail(email)
  }

  /**
   * Checks whether a user ID is valid (i.e. user exists).
   *
   * @param id - UUID of the user
   * @returns {Promise<boolean>} True if valid, false otherwise
   */
  async isValidId(id: string): Promise<boolean> {
    const user = await this.findById(id)
    return user !== null
  }
}
