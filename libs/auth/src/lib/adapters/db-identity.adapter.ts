// libs/auth/src/lib/adapters/db-identity.adapter.ts
// -----------------------------------------------------------------------------
// DB-backed identity adapter (MikroORM)
// -----------------------------------------------------------------------------
// What this adapter does
//   • Looks up users by id/email/username for login flows
//   • Resolves org membership roles for a user
//   • Loads/links OAuth identities (provider + providerUserId)
//   • Creates / revokes sessions
//
// Implementation notes
//   • Uses MikroORM's EntityManager injected via @mikro-orm/nestjs
//   • Imports entity classes from @helixai/db (your workspace lib)
//   • Returns lightweight shapes that Auth can use without DB details
//
// Workspace note (TS6307):
//   This file imports from @helixai/db. Ensure your root tsconfig.base.json defines
//   paths for @helixai/db and that libs/auth has a TS project reference to libs/db.
//   (You already asked for this earlier; once in place, TS6307 goes away.)

import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { InjectEntityManager } from '@mikro-orm/nestjs'

import type { Role, PrincipalSummary } from '../types/auth.types'

// ────────────────────────────────────────────────────────────────────────────
// Import your entities from the DB library barrel
//   If any names differ in your project, adjust here.
// ────────────────────────────────────────────────────────────────────────────
import { User, Membership, OAuthIdentity, Session } from '@helixai/db'

// Use the *DB entity's* provider type to avoid enum/union mismatches.
// (If OAuthIdentity.provider is an enum in the DB layer, this keeps types aligned.)
type DbOAuthProvider = OAuthIdentity['provider']

// ────────────────────────────────────────────────────────────────────────────
// Public contract for the adapter (methods Auth services/guards will call)
// Keep this interface small and focused on what Auth needs.
// ────────────────────────────────────────────────────────────────────────────
export interface IdentityAdapter {
  // Users
  findUserById(userId: string): Promise<User | null>
  findUserByEmail(email: string): Promise<User | null>
  findUserByUsername(username: string): Promise<User | null>

  // OAuth identities
  findOAuthIdentity(
    provider: DbOAuthProvider,
    providerUserId: string
  ): Promise<OAuthIdentity | null>

  linkOAuthIdentity(
    userId: string,
    provider: DbOAuthProvider,
    providerUserId: string,
    profile?: Partial<
      Omit<OAuthIdentity, 'id' | 'user' | 'provider' | 'providerUserId'>
    >
  ): Promise<OAuthIdentity>

  // Membership & principal context
  getUserOrgRoles(userId: string, orgId: string): Promise<Role[]>
  buildPrincipalSummary(
    userId: string,
    preferredOrgId?: string
  ): Promise<PrincipalSummary | null>

  // Sessions (short-lived server-side session records, separate from JWTs)
  createSession(params: {
    userId: string
    orgId?: string | null
    userAgent?: string | null
    ip?: string | null
    expiresAt?: Date | null
    metadata?: Record<string, unknown> | null
  }): Promise<Session>

  revokeSession(sessionId: string): Promise<void>
}

/* -----------------------------------------------------------------------------
 * Adapter implementation
 * -------------------------------------------------------------------------- */

@Injectable()
export class DbIdentityAdapter implements IdentityAdapter {
  // NOTE: Some versions of @mikro-orm/nestjs define InjectEntityManager(name: string)
  //       so we pass 'default' to satisfy the signature (fixes TS2554).
  constructor(
    @InjectEntityManager('default') private readonly em: EntityManager
  ) {}

  /* ------------------------------ User lookups ------------------------------ */

  /** Find a user by primary id. */
  async findUserById(userId: string): Promise<User | null> {
    // Adjust fields if your PK is not `id`
    return this.em.findOne(User, { id: userId })
  }

  /** Find a user by unique email (case-insensitive if you normalize). */
  async findUserByEmail(email: string): Promise<User | null> {
    // If you store emails normalized to lowercase, normalize input too.
    const e = email.trim().toLowerCase()
    return this.em.findOne(User, { email: e } as any)
  }

  /**
   * Find a user by unique username/handle.
   *
   * Why the `as any` cast?
   *   Your `User` entity might not declare a `username` property (e.g., it uses
   *   `handle` or `userName`). MikroORM’s FilterQuery is strongly typed; referencing
   *   unknown fields would cause TS complaints during compilation. Using a single
   *   `$or` query with an `as any` cast lets you support multiple common field names
   *   without fighting the compiler. Replace with your actual field name when known.
   */
  async findUserByUsername(username: string): Promise<User | null> {
    const u = username.trim()
    const where: any = {
      $or: [{ username: u }, { handle: u }, { userName: u }]
    }
    return this.em.findOne(User as any, where as any)
  }

  /* ---------------------------- OAuth identities --------------------------- */

  /** Look up an OAuth identity by (provider, providerUserId). */
  async findOAuthIdentity(
    provider: DbOAuthProvider,
    providerUserId: string
  ): Promise<OAuthIdentity | null> {
    // Using the DB entity’s provider type prevents enum/union mismatches.
    return this.em.findOne(OAuthIdentity, { provider, providerUserId } as any)
  }

  /**
   * Link (or upsert) an OAuth identity to an existing user.
   * - If an identity exists, it gets updated with fresh profile fields (best-effort).
   * - If not, a new identity is created and linked to the user.
   */
  async linkOAuthIdentity(
    userId: string,
    provider: DbOAuthProvider,
    providerUserId: string,
    profile?: Partial<
      Omit<OAuthIdentity, 'id' | 'user' | 'provider' | 'providerUserId'>
    >
  ): Promise<OAuthIdentity> {
    const user = await this.findUserById(userId)
    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    let identity = await this.findOAuthIdentity(provider, providerUserId)
    if (!identity) {
      identity = this.em.create(OAuthIdentity, {
        user,
        provider,
        providerUserId,
        ...profile
      } as any)
      await this.em.persistAndFlush(identity)
      return identity
    }

    // Update basic profile fields if provided (non-destructive merge)
    if (profile && Object.keys(profile).length > 0) {
      this.em.assign(identity, profile as any)
      await this.em.flush()
    }
    return identity
  }

  /* -------------------------- Membership / principal ------------------------ */

  /**
   * Return the user’s roles within a given org.
   * Assumes `Membership` has fields: userId, orgId, role (enum/string).
   * Adjust selectors if your schema differs.
   */
  async getUserOrgRoles(userId: string, orgId: string): Promise<Role[]> {
    const memberships = await this.em.find(Membership, { userId, orgId } as any)
    // Cast to your Role union; adjust mapping if your role field differs
    return memberships.map((m: any) => m.role as Role)
  }

  /**
   * Build a lightweight PrincipalSummary for downstream authz:
   *  - Picks a preferred org (provided or first membership if available)
   *  - Resolves roles for that org
   *  - Leaves scopes empty; your RBAC layer can compute scopes from roles
   */
  async buildPrincipalSummary(
    userId: string,
    preferredOrgId?: string
  ): Promise<PrincipalSummary | null> {
    const user = await this.findUserById(userId)
    if (!user) return null

    // Fetch memberships to pick an org if none provided
    const memberships = await this.em.find(Membership, { userId } as any)
    const orgId =
      preferredOrgId ??
      (memberships.length > 0 ? (memberships[0] as any).orgId : undefined)

    const roles = orgId ? await this.getUserOrgRoles(userId, orgId) : []

    // Map to your PrincipalSummary shape (email/displayName field names may differ)
    return {
      id: (user as any).id,
      email: (user as any).email ?? null,
      displayName: (user as any).displayName ?? (user as any).name ?? null,
      orgId: orgId ?? null,
      teamId: null, // Resolve/attach team context elsewhere if necessary
      roles,
      scopes: [], // Let RBAC derive scopes from roles in a ScopesGuard or service
      impersonatedBy: null
    }
  }

  /* -------------------------------- Sessions -------------------------------- */

  /**
   * Create a server-side session record.
   * Typical fields: userId, orgId, userAgent, ip, createdAt, expiresAt, metadata
   * Adjust to match your Session entity schema.
   */
  async createSession(params: {
    userId: string
    orgId?: string | null
    userAgent?: string | null
    ip?: string | null
    expiresAt?: Date | null
    metadata?: Record<string, unknown> | null
  }): Promise<Session> {
    const session = this.em.create(Session, {
      userId: params.userId,
      orgId: params.orgId ?? null,
      userAgent: params.userAgent ?? null,
      ip: params.ip ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: params.expiresAt ?? null,
      metadata: params.metadata ?? null,
      revokedAt: null
    } as any)
    await this.em.persistAndFlush(session)
    return session
  }

  /** Soft-revoke a session by setting revokedAt (preferred over hard delete). */
  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.em.findOne(Session, { id: sessionId })
    if (!session) return
    ;(session as any).revokedAt = new Date()
    await this.em.flush()
  }
}

/* -----------------------------------------------------------------------------
 * Optional helpers (pure mapping) — keep DB shapes decoupled from Auth shapes
 * -------------------------------------------------------------------------- */
// If you later want richer mapping (e.g., compute a user’s default org,
// flatten profile details, or stitch team roles), add small pure helpers here
// so your service code stays readable.
