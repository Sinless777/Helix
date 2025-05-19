import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Session } from './session.entity';
import { User } from '../user/user.entity';
import { v5 as uuidv5 } from 'uuidv5';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SessionService {
  constructor(
    readonly em: EntityManager,
    readonly httpService: HttpService,
  ) {}

  private readonly UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

  /**
   * Creates a new session for the given user.
   * @param user - The user for whom to create the session.
   * @param ipAddress - The IP address of the user.
   * @param userAgent - The user agent string of the user's browser.
   * @param geoLocation - The geographical location of the user.
   * @param geoIP - The geographical IP address of the user.
   * @returns The created session.
   */
  async createSession(
    user: User,
    ipAddress: string,
    userAgent: string,
    geoLocation?: string,
    geoIP?: string,
  ): Promise<Session> {
    const session = new Session();
    session.id = this.generateUuid(`${user.id}-${Date.now()}`);
    session.user = user;
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    session.geoLocation = geoLocation;
    session.geoIP = geoIP;

    await this.em.persistAndFlush(session);
    return session;
  }

  /**
   * Fetch geoIP information for a given IP address.
   * @param ipAddress - The IP address to fetch geoIP information for.
   * @returns The geoIP information.
   * @throws {Error} Various network or validation issues.
   */
  async fetchGeoIPInformation(ipAddress: string): Promise<any> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new Error('Invalid IP address format.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://geoip.example.com/${ipAddress}`),
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch geoIP information.');
      }
      return response.data;
    } catch (error) {
      throw new Error('GeoIP service is unavailable.');
    }
  }

  /**
   * Validates the format of an IP address.
   */
  validateIpAddress(ipAddress: string): boolean {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ipAddress);
  }

  /**
   * Fetch device information for a given user agent.
   */
  async fetchDeviceInformation(userAgent: string): Promise<any> {
    if (!this.validateUserAgent(userAgent)) {
      throw new Error('Invalid user agent format.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://device.example.com/${userAgent}`),
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch device information.');
      }
      return response.data;
    } catch (error) {
      throw new Error('Device service is unavailable.');
    }
  }

  /**
   * Validates the format of a user agent string.
   */
  validateUserAgent(userAgent: string): boolean {
    const userAgentRegex =
      /^(Mozilla|Opera|Chrome|Safari|Edge|Trident)\/[0-9]+\.[0-9]+/;
    return userAgentRegex.test(userAgent);
  }

  /**
   * Finds a session by its ID.
   */
  async findById(id: string): Promise<Session | null> {
    return this.em.findOne(Session, { id });
  }

  /**
   * Finds all sessions for a given user.
   */
  async findAllByUser(user: User): Promise<Session[]> {
    return this.em.find(Session, { user });
  }

  /**
   * Revokes a session by its ID.
   */
  async revokeSession(id: string): Promise<Session | null> {
    const session = await this.findById(id);
    if (!session) return null;
    session.revoked = true;
    await this.em.persistAndFlush(session);
    return session;
  }

  /**
   * Revokes all sessions for a given user.
   */
  async revokeAllSessionsForUser(user: User): Promise<Session[]> {
    const sessions = await this.findAllByUser(user);
    sessions.forEach((session) => (session.revoked = true));
    await this.em.persistAndFlush(sessions);
    return sessions;
  }

  /**
   * Generates a UUIDv5 using a namespace.
   */
  generateUuid(seed: string): string {
    return uuidv5(seed, this.UUID_NAMESPACE);
  }

  /**
   * Validates a UUID v5 string.
   */
  validateUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      uuid,
    );
  }

  /**
   * Delete a session
   * @param id - The ID of the session to delete.
   * @returns The deleted session.
   * @throws {Error} If the session is not found.
   * @throws {Error} If the session is already revoked.
   * @throws {Error} If the session is not valid.
   * @throws {Error} If the session is not valid.
   * @throws {Error} If the session is not valid.
   */

  async deleteSession(id: string): Promise<void> {
    const session = await this.findById(id);
    if (!session) throw new Error('Session not found');
    if (session.revoked) throw new Error('Session already revoked');
    if (!this.validateUuid(session.id)) throw new Error('Invalid session ID');

    await this.em.removeAndFlush(session);

    return;
  }

  /**
   * Delete all sessions for a user
   * @param userId - The ID of the user whose sessions to delete.
   * @returns The deleted sessions.
   * @throws {Error} If the user is not found.
   * @throws {Error} If the session is not valid.
   */
  async deleteAllSessionsForUser(user: User): Promise<void> {
    const sessions = await this.findAllByUser(user);
    for (const session of sessions) {
      await this.deleteSession(session.id);
    }
  }
}
