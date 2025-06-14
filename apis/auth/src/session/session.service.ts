import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { Session } from './session.entity'
import { User } from '../user/user.entity'
import { v5 as uuidv5 } from 'uuid'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

/**
 * Service responsible for managing user sessions:
 * creation, validation, revocation, and device/geo lookups.
 */
@Injectable()
export class SessionService {
  constructor(
    readonly em: EntityManager,
    readonly httpService: HttpService,
  ) {}

  private readonly UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

  /**
   * Creates a new session for a user.
   *
   * @param user - User entity
   * @param ipAddress - IP address of the user
   * @param userAgent - User agent string
   * @param geoLocation - Optional location
   * @param geoIP - Optional geo IP data
   * @returns The persisted Session entity
   */
  async createSession(
    user: User,
    ipAddress: string,
    userAgent: string,
    geoLocation?: string,
    geoIP?: string,
  ): Promise<Session> {
    const session = new Session()
    session.id = this.generateUuid(`${user.id}-${Date.now()}`)
    session.user = user
    session.ipAddress = ipAddress
    session.userAgent = userAgent
    session.geoLocation = geoLocation
    session.geoIP = geoIP

    await this.em.persistAndFlush(session)
    return session
  }

  /**
   * Fetches geoIP information from an external service.
   *
   * @param ipAddress - IPv4 address
   * @returns Location data
   * @throws Error if the IP is invalid or fetch fails
   */
  async fetchGeoIPInformation(ipAddress: string): Promise<any> {
    if (!this.validateIpAddress(ipAddress)) {
      throw new Error('Invalid IP address format.')
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://geoip.example.com/${ipAddress}`),
      )
      if (response.status !== 200) {
        throw new Error('Failed to fetch geoIP information.')
      }
      return response.data
    } catch {
      throw new Error('GeoIP service is unavailable.')
    }
  }

  /**
   * Validates an IPv4 address format.
   *
   * @param ipAddress - IP string
   * @returns True if valid
   */
  validateIpAddress(ipAddress: string): boolean {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipRegex.test(ipAddress)
  }

  /**
   * Fetches device metadata from an external service.
   *
   * @param userAgent - User agent string
   * @returns Device info
   * @throws Error if user agent is invalid or fetch fails
   */
  async fetchDeviceInformation(userAgent: string): Promise<any> {
    if (!this.validateUserAgent(userAgent)) {
      throw new Error('Invalid user agent format.')
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://device.example.com/${userAgent}`),
      )
      if (response.status !== 200) {
        throw new Error('Failed to fetch device information.')
      }
      return response.data
    } catch {
      throw new Error('Device service is unavailable.')
    }
  }

  /**
   * Validates a user-agent string format.
   *
   * @param userAgent - User agent string
   * @returns True if valid
   */
  validateUserAgent(userAgent: string): boolean {
    const userAgentRegex =
      /^(Mozilla|Opera|Chrome|Safari|Edge|Trident)\/[0-9]+\.[0-9]+/
    return userAgentRegex.test(userAgent)
  }

  /**
   * Finds a session by ID.
   *
   * @param id - Session UUID
   * @returns Session or null
   */
  async findById(id: string): Promise<Session | null> {
    return this.em.findOne(Session, { id })
  }

  /**
   * Returns all sessions for a given user.
   *
   * @param user - User entity
   * @returns Array of sessions
   */
  async findAllByUser(user: User): Promise<Session[]> {
    return this.em.find(Session, { user })
  }

  /**
   * Revokes a session by marking it inactive.
   *
   * @param id - Session UUID
   * @returns The updated session or null
   */
  async revokeSession(id: string): Promise<Session | null> {
    const session = await this.findById(id)
    if (!session) return null

    session.revoked = true
    await this.em.persistAndFlush(session)
    return session
  }

  /**
   * Revokes all sessions for a user.
   *
   * @param user - The user entity
   * @returns The updated sessions
   */
  async revokeAllSessionsForUser(user: User): Promise<Session[]> {
    const sessions = await this.findAllByUser(user)
    sessions.forEach((session) => (session.revoked = true))
    await this.em.persistAndFlush(sessions)
    return sessions
  }

  /**
   * Generates a deterministic UUIDv5.
   *
   * @param seed - A string to hash
   * @returns UUID string
   */
  generateUuid(seed: string): string {
    return uuidv5(seed, this.UUID_NAMESPACE)
  }

  /**
   * Validates a UUIDv5 format.
   *
   * @param uuid - The UUID string
   * @returns True if valid
   */
  validateUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      uuid,
    )
  }

  /**
   * Deletes a session by ID.
   *
   * @param id - Session UUID
   * @throws Error if session is invalid or already revoked
   */
  async deleteSession(id: string): Promise<void> {
    const session = await this.findById(id)
    if (!session) throw new Error('Session not found')
    if (session.revoked) throw new Error('Session already revoked')
    if (!this.validateUuid(session.id)) throw new Error('Invalid session ID')

    await this.em.removeAndFlush(session)
  }

  /**
   * Deletes all sessions for a user.
   *
   * @param user - The user entity
   * @throws Error if any session fails validation or deletion
   */
  async deleteAllSessionsForUser(user: User): Promise<void> {
    const sessions = await this.findAllByUser(user)
    for (const session of sessions) {
      await this.deleteSession(session.id)
    }
  }
}
