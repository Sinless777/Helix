import type {
  EntityData,
  EntityName,
  EntityRepository,
  FilterQuery,
  FindOptions,
  FindOneOptions,
  Loaded,
  Primary,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';

/**
 * Generic base repository for MikroORM v6.
 * NOTE: MikroORM's advanced generic types can be noisy; we normalize returned
 * values to `Loaded<T, any>` and cast at boundaries to keep consumers ergonomic.
 *
 * Extend per entity, e.g.:
 *
 *   export class UserRepository extends BaseRepository<User> {
 *     constructor(em: EntityManager) { super(em, User); }
 *   }
 */
export abstract class BaseRepository<T extends object> {
  protected readonly em: EntityManager;
  protected readonly repo: EntityRepository<T>;
  protected readonly entityName: EntityName<T>;

  protected constructor(em: EntityManager, entity: EntityName<T>) {
    this.em = em;
    this.entityName = entity;
    this.repo = em.getRepository<T>(entity);
  }

  // ──────────────────────────────── CRUD ─────────────────────────────────

  /** Create a new entity instance (not yet persisted). */
  create(data: EntityData<T>): T {
    return this.repo.create(data as any);
  }

  /** Create and persist (optionally flush). */
  async createAndPersist(data: EntityData<T>, flush = true): Promise<T> {
    const entity = this.repo.create(data as any);
    this.em.persist(entity);
    if (flush) await this.em.flush();
    return entity;
  }

  /**
   * Upsert via EntityManager (uses driver's native upsert).
   * Keep params simple for portability across drivers.
   */
  async upsert(data: EntityData<T>, flush = true): Promise<T> {
    const entity = (await this.em.upsert(
      this.entityName as any,
      data as any,
    )) as unknown as T;
    if (flush) await this.em.flush();
    return entity;
  }

  /** Find by primary key (assumes PK is `id` in the filter object). */
  async findById(
    id: Primary<T>,
    options?: FindOneOptions<T, any>,
  ): Promise<Loaded<T, any> | null> {
    const res = await this.repo.findOne({ id } as any, options as any);
    return res as unknown as Loaded<T, any> | null;
  }

  /** Find one or throw with a custom message. */
  async findOneOrThrow(
    where: FilterQuery<T>,
    options?: FindOneOptions<T, any>,
    message = 'Entity not found',
  ): Promise<Loaded<T, any>> {
    const e = (await this.repo.findOne(where as any, options as any)) as unknown as
      | Loaded<T, any>
      | null;
    if (!e) throw new Error(message);
    return e;
  }

  /** Find many with generic options. */
  async find(
    where: FilterQuery<T>,
    options?: FindOptions<T, any>,
  ): Promise<Loaded<T, any>[]> {
    const rows = await this.repo.find(where as any, options as any);
    return rows as unknown as Loaded<T, any>[];
  }

  /** Count with an optional filter. */
  count(where?: FilterQuery<T>): Promise<number> {
    return this.repo.count(where as any);
  }

  /** Existence check (fast path). */
  async exists(where: FilterQuery<T>): Promise<boolean> {
    const e = await this.repo.findOne(where as any, { fields: ['id'] } as any);
    return !!e;
  }

  /** Partial update via native query; returns affected row count. */
  async update(
    where: FilterQuery<T>,
    data: Partial<T>,
    flush = true,
  ): Promise<number> {
    const affected = await this.repo.nativeUpdate(where as any, data as any);
    if (flush) await this.em.flush();
    return affected;
  }

  /** Remove a managed entity (EntityManager API in v6). */
  async remove(entity: T, flush = true): Promise<void> {
    this.em.remove(entity as any);
    if (flush) await this.em.flush();
  }

  /** Delete by filter; returns affected row count. */
  async removeWhere(where: FilterQuery<T>, flush = true): Promise<number> {
    const affected = await this.repo.nativeDelete(where as any);
    if (flush) await this.em.flush();
    return affected;
  }

  /**
   * Soft-delete helper: if the entity has a `deletedAt` field, set it;
   * otherwise perform a hard delete.
   */
  async softDelete(
    entity: T & Partial<{ deletedAt?: Date }>,
    flush = true,
  ): Promise<void> {
    if ('deletedAt' in entity) {
      (entity as any).deletedAt = new Date();
      this.em.persist(entity as any);
      if (flush) await this.em.flush();
      return;
    }
    await this.remove(entity, flush);
  }

  // ───────────────────────────── Pagination ──────────────────────────────

  /**
   * Offset pagination (page starts at 1). Caps limit to 200 by default.
   * Returns `Loaded<T, any>[]` to align with MikroORM's `find()` output.
   */
  async paginate(
    where: FilterQuery<T> = {} as any,
    options: FindOptions<T, any> & { page?: number; limit?: number } = {},
  ): Promise<{
    items: Loaded<T, any>[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(200, Math.max(1, options.limit ?? 20));
    const [rows, total] = await Promise.all([
      this.repo.find(where as any, { ...(options as any), limit, offset: (page - 1) * limit }),
      this.repo.count(where as any),
    ]);
    const items = rows as unknown as Loaded<T, any>[];
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Cursor pagination using a sortable key (must be provided explicitly).
   * Returns nextCursor (value of the key in the last item) if more results may exist.
   */
  async cursorPage(
    where: FilterQuery<T> = {} as any,
    options: Omit<FindOptions<T, any>, 'offset'> & {
      limit?: number;
      after?: any;
      /** Name of the sortable field to order by (e.g., 'id' or 'createdAt'). */
      orderByKey: string;
    },
  ): Promise<{ items: Loaded<T, any>[]; limit: number; nextCursor: any | null }> {
    const limit = Math.min(200, Math.max(1, options.limit ?? 20));
    const key = options.orderByKey;

    const extra: any = options.after != null ? { [key]: { $gt: options.after } } : {};
    const cond = { ...(where as any), ...extra };
    const orderBy = { [key]: 'asc' } as any;

    const rows = await this.repo.find(cond, { ...(options as any), limit, orderBy });
    const items = rows as unknown as Loaded<T, any>[];
    const last = (items[items.length - 1] as any) ?? null;
    const nextCursor = items.length === limit ? last?.[key] ?? null : null;
    return { items, limit, nextCursor };
  }

  // ───────────────────────────── Transactions ────────────────────────────

  /** Run a function in a transactional EntityManager. */
  transactional<R>(fn: (em: EntityManager) => Promise<R>): Promise<R> {
    return this.em.transactional(fn);
  }

  // ───────────────────────────── Utilities ───────────────────────────────

  flush(): Promise<void> {
    return this.em.flush();
  }

  clear(): void {
    this.em.clear();
  }
}
