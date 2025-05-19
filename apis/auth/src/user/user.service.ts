import { EntityManager } from '@mikro-orm/postgresql';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Creates a new user with the given email.
   * @param email - The email of the user to create.
   * @param password - The password of the user to create.
   * @returns The created user.
   *
   * @throws {Error} If the user already exists.
   * @throws {Error} If the email is invalid.
   * @throws {Error} If the password is invalid.
   * @throws {Error} If the user cannot be created.
   *
   */
  async create(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const existingUser = await this.em.findOne(User, { email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User();
    user.email = email;

    // Hash the password before saving
    user.passwordHash = await bcrypt.hash(password, 1000);

    await this.em.persistAndFlush(user);
    return user;
  }

  /**
   * Finds a user by their email.
   * @param email - The email of the user to find.
   * @returns The found user or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  /**
   * Finds a user by their ID.
   * @param id - The ID of the user to find.
   * @returns The found user or null if not found.
   */
  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  /**
   * Returns all users.
   * @returns An array of all users.
   */
  async all(): Promise<User[]> {
    return this.em.find(User, {});
  }

  /**
   * Updates a user with the given ID and updates.
   * @param id - The ID of the user to update.
   * @param updates - The updates to apply to the user.
   * @returns The updated user.
   */
  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updates);
    await this.em.persistAndFlush(user);
    return user;
  }

  /**
   * Deletes a user with the given ID.
   * @param id - The ID of the user to delete.
   * @returns A promise that resolves when the user is deleted.
   */
  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.em.removeAndFlush(user);
  }

  /**
   * Checks if the given password matches the user's password.
   * @param user - The user to check.
   * @param password - The password to check.
   * @returns True if the password matches, false otherwise.
   */
  async checkPassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) {
      throw new Error('User has no password set');
    }
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Checks if the given email is valid.
   * @param email - The email to check.
   * @returns True if the email is valid, false otherwise.
   */

  async isValidEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Checks if the given password is valid.
   * @param password - The password to check.
   * @returns True if the password is valid, false otherwise.
   *
   * PASSWORD MUST BE 8 CHARACTERS LONG, CONTAIN AT LEAST ONE UPPERCASE LETTER, ONE LOWERCASE LETTER, ONE NUMBER, AND ONE SPECIAL CHARACTER
   */
  async isValidPassword(password: string): Promise<boolean> {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Checks if the given email is already in use.
   * @param email - The email to check.
   * @returns True if the email is already in use, false otherwise.
   */
  async isEmailInUse(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Checks if the given user ID is valid.
   * @param id - The ID to check.
   * @returns True if the ID is valid, false otherwise.
   */
  async isValidId(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }
}
