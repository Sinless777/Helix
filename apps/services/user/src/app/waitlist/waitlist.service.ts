import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { WaitlistEntry } from '@helix-ai/db/entities';
import { CreateWaitlistDto } from './waitlist.dto';
import { HYPERTUNE_SOURCE } from '../hypertune.module';
import {
  SourceNode,
  Context,
  Environment,
  EnvironmentEnumValues,
} from '@helix-ai/core/hypertune/hypertune';
import { LoggerService } from '@helix-ai/logger';

const DEFAULT_ENVIRONMENT: Environment = 'development';

// ----------------------------------------
// Helper: normalize environments
// ----------------------------------------
function coerceEnvironment(
  value?: string | null,
  fallback: Environment = DEFAULT_ENVIRONMENT,
): Environment {
  if (!value) return fallback;
  const match = EnvironmentEnumValues.find((env) => env === value);
  return (match ?? fallback) as Environment;
}

function buildHypertuneContext(): Context {
  const env = coerceEnvironment(
    process.env.HYPERTUNE_ENVIRONMENT,
    coerceEnvironment(process.env.NODE_ENV),
  );

  return {
    environment: env,
    user: {
      id: 'system',
      name: 'system',
      email: 'system@helix.ai',
    },
  };
}

@Injectable()
export class WaitlistService {
  private readonly logger = new LoggerService({
    serviceName: 'user-service',
    environment: process.env.NODE_ENV ?? 'development',
    minLevel: 'debug',
    enableConsole: true,
    lokiEndpoint: process.env.LOKI_ENDPOINT ?? undefined,
    defaultLabels: { component: 'WaitlistService' },
  });

  constructor(
    private readonly em: EntityManager,

    @Inject(HYPERTUNE_SOURCE)
    private readonly hypertune: SourceNode,
  ) {}

  // ----------------------------------------
  // CREATE ENTRY
  // ----------------------------------------
  async create(dto: CreateWaitlistDto) {
    this.logger.info('Waitlist create() invoked', { dto });

    // Basic payload validation to avoid "reading 'email' of undefined"
    if (!dto) {
      this.logger.warn('Waitlist create() called with empty body');
      throw new BadRequestException('Request body is required.');
    }

    if (!dto.email) {
      this.logger.warn('Waitlist create() missing email', { dto });
      throw new BadRequestException('Email is required.');
    }

    let enabled = false;

    try {
      if (!this.hypertune) {
        this.logger.warn(
          'Hypertune SourceNode missing — waitlistEnabled forced to false.',
        );
      } else {
        const context = buildHypertuneContext();

        this.logger.debug('Building hypertune context', { context });

        const root = this.hypertune.root({ args: { context } });

        this.logger.trace('Requesting waitlistEnabled flag from hypertune');

        enabled = root.waitlistEnabled({ fallback: false });

        this.logger.debug('Resolved waitlistEnabled flag', { enabled });
      }
    } catch (err) {
      this.logger.error('Failed to read waitlistEnabled from hypertune', {
        error: err instanceof Error ? err.stack : err,
      });
      enabled = false;
    }

    if (!enabled) {
      this.logger.warn(
        'Waitlist creation blocked: waitlistEnabled = false',
      );
      throw new NotFoundException('Waitlist is currently disabled.');
    }

    this.logger.info('Waitlist is enabled — proceeding with entry creation');

    const now = new Date();
    const entry = this.em.create(WaitlistEntry, {
      email: dto.email.toLowerCase(),
      name: dto.name,
      source: dto.source,
      refCode: dto.refCode,
      cohort: dto.cohort,
      metadata: dto.metadata,
      status: 'pending',
      appliedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    this.logger.audit('Creating new waitlist entry', { email: entry.email });

    await this.em.persistAndFlush(entry);

    this.logger.info('Waitlist entry created successfully', {
      id: entry.id,
      email: entry.email,
    });

    return entry;
  }

  // ----------------------------------------
  // GET ALL
  // ----------------------------------------
  async findAll() {
    this.logger.debug('Fetching all waitlist entries');

    const items = await this.em.find(
      WaitlistEntry,
      {},
      { orderBy: { createdAt: 'DESC' } },
    );

    this.logger.info('Fetched waitlist entries', { count: items.length });

    return items;
  }

  // ----------------------------------------
  // GET BY EMAIL
  // ----------------------------------------
  async findByEmail(email: string) {
    const normalized = email.toLowerCase();

    this.logger.debug('Searching waitlist entry by email', {
      email: normalized,
    });

    const found = await this.em.findOne(WaitlistEntry, {
      email: normalized,
    });

    if (!found) {
      this.logger.warn('Waitlist entry not found', { email: normalized });
      throw new NotFoundException('Waitlist entry not found');
    }

    this.logger.info('Found waitlist entry', {
      id: found.id,
      email: normalized,
    });

    return found;
  }

  // ----------------------------------------
  // UPDATE STATUS
  // ----------------------------------------
  async updateStatus(email: string, status: string) {
    this.logger.info('Updating waitlist status', { email, status });

    const entry = await this.findByEmail(email);

    const before = entry.status;
    entry.status = status;
    entry.updatedAt = new Date();

    await this.em.flush();

    this.logger.audit('Waitlist status updated', {
      email: entry.email,
      oldStatus: before,
      newStatus: status,
    });

    return entry;
  }
}
