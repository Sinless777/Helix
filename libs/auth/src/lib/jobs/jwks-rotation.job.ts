// libs/auth/src/lib/jobs/jwks-rotation.job.ts
// -----------------------------------------------------------------------------
// JWKS Rotation Job
// -----------------------------------------------------------------------------
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { authConfig, type AuthConfig } from '../config/auth.config'

/* -----------------------------------------------------------------------------
 * Minimal rotator contract + DI token
 * -------------------------------------------------------------------------- */
export interface JwksRotator {
  rotateIfDue(opts?: {
    rotationDays?: number
    now?: Date
  }): Promise<{ rotated: boolean; kid?: string; nextRotateAt?: Date }>

  getStatus?(): Promise<
    | {
        kid?: string
        rotatedAt?: Date
        nextRotateAt?: Date
      }
    | undefined
  >
}

export const JWKS_ROTATOR = Symbol('JWKS_ROTATOR')

/* -----------------------------------------------------------------------------
 * Job implementation
 * -------------------------------------------------------------------------- */

@Injectable()
export class JwksRotationJob implements OnModuleInit {
  private readonly log = new Logger(JwksRotationJob.name)

  constructor(
    // Typed config for rotation cadence (and other JWKS settings if desired)
    @Inject(authConfig.KEY) private readonly cfg: AuthConfig,
    // Rotator service (optional so the lib can compile without an implementation)
    @Optional() @Inject(JWKS_ROTATOR) private readonly rotator?: JwksRotator
  ) {}

  /**
   * Run an initial rotation check on boot so a fresh deployment immediately has
   * valid signing keys even before the first cron fires.
   */
  async onModuleInit(): Promise<void> {
    if (!this.rotator) {
      this.log.warn(
        'JWKS rotator not configured; key rotation will not be performed.'
      )
      return
    }
    await this.checkAndRotate('startup')
  }

  /**
   * Nightly rotation check (01:00 local time by default).
   * The rotator encapsulates idempotency and persistence.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async nightlyRotation(): Promise<void> {
    if (!this.rotator) return
    await this.checkAndRotate('cron')
  }

  /* ------------------------------------------------------------------------- */
  /* Internal helpers                                                          */
  /* ------------------------------------------------------------------------- */

  /**
   * Shared routine to invoke the rotator and log a compact status line.
   * Avoids non-null assertions by guarding the injected dependency locally.
   */
  private async checkAndRotate(trigger: 'startup' | 'cron'): Promise<void> {
    // Local guard (instead of `this.rotator!`) to satisfy eslint rule.
    const rotator = this.rotator
    if (!rotator) return

    try {
      const rotationDays = this.cfg.jwks.rotationDays
      const now = new Date()

      // Perform an idempotent rotation if due.
      const result = await rotator.rotateIfDue({ rotationDays, now })

      // Get current status if the rotator provides it (optional).
      const status = (await rotator.getStatus?.()) ?? {}

      // Prefer the most precise KID/next date available.
      const kid = result.kid ?? status.kid ?? 'unknown'
      const nextDate = result.nextRotateAt ?? status.nextRotateAt
      const next = nextDate ? nextDate.toISOString() : 'unknown'

      if (result.rotated) {
        this.log.log(
          `JWKS rotated (${trigger}). active kid=${kid}; next rotation ~ ${next} (every ${rotationDays}d)`
        )
      } else {
        this.log.debug(
          `JWKS rotation not due (${trigger}). active kid=${kid}; next rotation ~ ${next} (every ${rotationDays}d)`
        )
      }
    } catch (err) {
      // Rotation failures should be visible but not crash the process.
      this.log.error(
        `JWKS rotation check failed (${trigger}): ${String(err)}`,
        err instanceof Error && err.stack ? err.stack : undefined
      )
    }
  }
}
