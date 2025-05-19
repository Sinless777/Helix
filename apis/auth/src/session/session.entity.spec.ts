import { Session } from './session.entity'
import { User } from '../user/user.entity'
import { v5 as uuidv5, validate as validateUUID } from 'uuid'

/**
 * Unit tests for the Session entity.
 * Verifies entity initialization and UUID generation.
 */
describe('Session Entity', () => {
  const MOCK_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

  it('should create a session with required fields', () => {
    const user = new User()
    user.id = uuidv5('user@example.com', MOCK_NAMESPACE)
    user.email = 'user@example.com'
    user.passwordHash = 'hashedpassword'

    const session = new Session()
    session.user = user
    session.ipAddress = '192.168.1.1'
    session.userAgent = 'Mozilla/5.0'
    session.generateId() // manually trigger lifecycle hook

    expect(session).toBeDefined()
    expect(validateUUID(session.id)).toBe(true)
    expect(session.user).toEqual(user)
    expect(session.ipAddress).toBe('192.168.1.1')
    expect(session.userAgent).toBe('Mozilla/5.0')
    expect(session.createdAt).toBeInstanceOf(Date)
    expect(session.updatedAt).toBeInstanceOf(Date)
    expect(session.revoked).toBe(false)
  })

  it('should allow optional expiration date to be set', () => {
    const session = new Session()
    const expires = new Date(Date.now() + 1000 * 60 * 60) // +1 hour
    session.expiresAt = expires

    expect(session.expiresAt).toBeInstanceOf(Date)
    expect(session.expiresAt).toEqual(expires)
  })
})
