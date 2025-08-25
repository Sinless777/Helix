// libs/auth/src/lib/jobs/jwks-rotation.job.ts
// -----------------------------------------------------------------------------
// JWKS Rotation Job
// -----------------------------------------------------------------------------
// What this does
//   • On app start: ensures a valid signing key exists (by calling rotateIfDue())
//   • On a daily schedule: checks whether rotation is due and rotates if needed
//   • Logs succinct status so you can trace rotations in production
//
// Why it's decoupled
//   We depend on a *minimal* rotator interface (see JWKS_ROTATOR) instead of a
//   concrete service. Your auth module can bind any implementation that knows
//   how to:
//     - determine whether rotation is due
//     - rotate and persist new key material
//     - optionally report status for logging/monitoring
//
// Scheduling
//   Uses @nestjs/schedule's Cron API. Default: every day at 01:00 server time.
//   You can change the cron without touching the rotator/service logic.
//
// Config
//   Pulls rotation cadence from your typed `auth` config (rotationDays).
//   You can extend this to pass modulusLength, etc., to the rotator if needed.

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

/**
 * A minimal interface your JWKS/key service should implement to be usable by this job.
 * Keep it intentionally small so different implementations can be plugged in.
 */
export interface JwksRotator {
  /**
   * Rotate keys if the configured window has elapsed.
   * Implementations should be *idempotent* and safe to call frequently.
   *
   * @param opts.rotationDays  Number of whole days between rotations
   * @param opts.now           Clock value to use (defaults to new Date())
   * @returns { rotated, kid?, nextRotateAt? }  Whether a rotation occurred and basic metadata
   */
  rotateIfDue(opts?: {
    rotationDays?: number
    now?: Date
  }): Promise<{ rotated: boolean; kid?: string; nextRotateAt?: Date }>

  /**
   * Optional status hook used only for logging/observability.
   * Implementations may return undefined if not supported.
   */
  getStatus?(): Promise<
    | {
        kid?: string
        rotatedAt?: Date
        nextRotateAt?: Date
      }
    | undefined
  >
}

/** Injection token used to provide a JwksRotator implementation. */
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
   * onModuleInit:
   *   Run a first-time check on boot so a fresh deployment immediately has
   *   the proper signing key, even if the scheduled cron hasn't fired yet.
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
   * Nightly rotation check.
   * - Uses a fixed daily cron (01:00 local time). Adjust as you like.
   * - Calls into the rotator which handles idempotent logic and persistence.
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
   * Shared routine to invoke the rotator and log a compact, actionable line.
   * The rotator decides if rotation is due based on its own persisted state.
   */
  private async checkAndRotate(trigger: 'startup' | 'cron'): Promise<void> {
    try {
      const rotationDays = this.cfg.jwks.rotationDays
      const now = new Date()

      // Ask the rotator to perform an idempotent rotation if the window elapsed.
      const result = await this.rotator!.rotateIfDue({ rotationDays, now })

      // Build a friendly status line
      const status = (await this.rotator!.getStatus?.()) ?? {}
      const kid = result.kid ?? status.kid ?? 'unknown'
      const next =
        (result.nextRotateAt ?? status.nextRotateAt)
          ? (result.nextRotateAt ?? status.nextRotateAt)!.toISOString()
          : 'unknown'

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
      // Hardening: rotation failures should be visible but not crash the process.
      this.log.error(
        `JWKS rotation check failed (${trigger}): ${String(err)}`,
        err instanceof Error && err.stack ? err.stack : undefined
      )
    }
  }
}
