import {
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/core';
import { User } from '../entities/user.entity';

export class UserRepository extends EntityRepository<User> {
  // ───────────────────────────── lookups ─────────────────────────────

  async findById(id: string): Promise<User | null> {
    return this.findOne({ id } as FilterQuery<User>);
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.findOne(
      { id, deletedAt: null, disabledAt: null } as FilterQuery<User>,
    );
  }

  /**
   * Find by email (case-insensitive).
   * Uses the normalized `emailLower` column for speed + uniqueness.
   */
  async findByEmail(email: string): Promise<User | null> {
    const emailLower = String(email).trim().toLowerCase();
    return this.findOne({ emailLower } as FilterQuery<User>);
  }

  async findActiveByEmail(email: string): Promise<User | null> {
    const emailLower = String(email).trim().toLowerCase();
    return this.findOne(
      { emailLower, deletedAt: null, disabledAt: null } as FilterQuery<User>,
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const emailLower = String(email).trim().toLowerCase();
    return (await this.count({ emailLower } as FilterQuery<User>)) > 0;
  }

  async listByIds(ids: readonly string[]): Promise<User[]> {
    if (!ids.length) return [];
    return this.find({ id: { $in: [...ids] } } as FilterQuery<User>);
  }

  /**
   * Simple free-text search over email fields.
   * Note: `$ilike` is Postgres/Cockroach-specific.
   */
  async searchByEmail(q: string, limit = 20): Promise<User[]> {
    const s = `%${String(q).trim().toLowerCase()}%`;
    return this.find(
      { emailLower: { $ilike: s } } as FilterQuery<User>,
      { limit, orderBy: { createdAt: 'desc' } },
    );
  }

  // ───────────────────────── auth helpers ────────────────────────────

  /** Mark email verified (idempotent). */
  async verifyEmail(user: User, when: Date = new Date()): Promise<void> {
    user.markEmailVerified(when);
    await this.getEntityManager().persistAndFlush(user);
  }

  /** Update password hash & metadata. */
  async setPasswordHash(
    user: User,
    hash: string,
    version?: number,
    when: Date = new Date(),
  ): Promise<void> {
    user.setPasswordHash(hash, version, when);
    await this.getEntityManager().persistAndFlush(user);
  }

  /** Record a successful login (resets failures, bump counters, clears lock). */
  async markLoginSuccess(user: User, when: Date = new Date()): Promise<void> {
    user.markLoginSuccess(when);
    await this.getEntityManager().persistAndFlush(user);
  }

  /**
   * Record a failed login and (optionally) set lockout with exponential backoff.
   * Defaults: start backoff after 3 failures, base=10s, max=15m.
   */
  async markLoginFailure(
    user: User,
    when: Date = new Date(),
    baseLockSeconds = 10,
    maxLockSeconds = 15 * 60,
  ): Promise<void> {
    user.markLoginFailure(when, baseLockSeconds, maxLockSeconds);
    await this.getEntityManager().persistAndFlush(user);
  }

  /** Soft-delete a user (reversible). */
  async softDeleteById(id: string, when: Date = new Date()): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;
    user.softDelete(when);
    await this.getEntityManager().persistAndFlush(user);
    return true;
  }

  /** Disable or re-enable an account. */
  async setDisabledById(id: string, disabled: boolean, when: Date = new Date()): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;
    user.setDisabled(disabled, when);
    await this.getEntityManager().persistAndFlush(user);
    return true;
  }

  // ───────────────────────── pagination ──────────────────────────────

  /**
   * Cursor-less pagination (page/limit).
   * Returns items + total + paging metadata.
   */
  async paginate(
    where: FilterQuery<User> = {} as FilterQuery<User>,
    page = 1,
    limit = 20,
    orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' },
  ): Promise<{ items: User[]; total: number; page: number; limit: number; pages: number }> {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const [items, total] = await Promise.all([
      this.find(where, { limit: safeLimit, offset: (safePage - 1) * safeLimit, orderBy }),
      this.count(where),
    ]);
    const pages = Math.max(1, Math.ceil(total / safeLimit));
    return { items, total, page: safePage, limit: safeLimit, pages };
  }

  /**
   * Forward-only cursor pagination using createdAt + id as the cursor.
   * Supply the previous `{ createdAt, id }` to get the next page.
   */
  async paginateAfter(
    where: FilterQuery<User> = {} as FilterQuery<User>,
    limit = 20,
    after?: { createdAt: Date; id: string },
  ): Promise<{
    items: User[];
    limit: number;
    nextCursor: { createdAt: Date; id: string } | null;
  }> {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

    const cursorWhere =
      after
        ? ({
            $and: [
              where,
              {
                $or: [
                  { createdAt: { $lt: after.createdAt } },
                  { createdAt: after.createdAt, id: { $lt: after.id } },
                ],
              },
            ],
          } as FilterQuery<User>)
        : (where as FilterQuery<User>);

    const items = await this.find(cursorWhere, {
      limit: safeLimit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const next =
      items.length === safeLimit
        ? { createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id }
        : null;

    return { items, limit: safeLimit, nextCursor: next };
  }
}

/*
Wiring notes:
- To get MikroORM to return this custom repository from `em.getRepository(User)`,
  set it on the entity: `@Entity({ tableName: 'user', customRepository: () => UserRepository })`
  (in `user.entity.ts`). Otherwise, `em.getRepository(User)` returns the base `EntityRepository<User>`.
- With NestJS + @mikro-orm/nestjs, you can inject it using `@InjectRepository(User) repo: UserRepository`
  once `customRepository` is configured as above.
*/
