// apps/services/user/src/app/hypertune.module.ts

import { Global, Module } from '@nestjs/common';
import {
  SourceNode,
  emptySource,
  createSourceForServerOnly,
} from '@helix-ai/core/hypertune/hypertune';
import { LoggerService } from '@helix-ai/logger';

// ----------------------------------------------------
// Injection Token
// ----------------------------------------------------
//
// Keep this value as 'HYPERTUNE' so existing
// `@Inject('HYPERTUNE')` continues to work.
export const HYPERTUNE_SOURCE = 'HYPERTUNE';

// ----------------------------------------------------
// Token Resolution
// ----------------------------------------------------
function resolveHypertuneToken(): string {
  return (
    process.env.HYPERTUNE_TOKEN ??
    process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN ??
    ''
  );
}

// ----------------------------------------------------
// Remote Logging Settings
// ----------------------------------------------------
function resolveRemoteLogging():
  | {
      mode?: 'off' | 'normal' | 'session';
      flushIntervalMs?: number | null;
      endpointUrl?: string;
    }
  | undefined {
  const modeEnv = process.env.HYPERTUNE_REMOTE_LOGGING_MODE;
  const flushEnv = process.env.HYPERTUNE_REMOTE_LOGGING_FLUSH_MS;
  const endpointEnv = process.env.HYPERTUNE_REMOTE_LOGGING_ENDPOINT;

  const mode =
    modeEnv === 'normal' || modeEnv === 'session' || modeEnv === 'off'
      ? modeEnv
      : 'off';

  const flushIntervalMs =
    typeof flushEnv === 'string' && flushEnv.length > 0
      ? Number.isNaN(Number(flushEnv))
        ? undefined
        : Number(flushEnv)
      : undefined;

  return {
    mode,
    flushIntervalMs,
    endpointUrl: endpointEnv,
  };
}

// ----------------------------------------------------
// Hypertune -> Helix logger bridge
// ----------------------------------------------------
type HypertuneMessage = {
  level: string;
  message: string;
  metadata?: Record<string, unknown>;
};

type HypertuneLogs = {
  messageList?: HypertuneMessage[];
  eventList?: unknown[];
  exposureList?: unknown[];
  evaluationList?: unknown[];
};

function makeLogsHandler(logger: LoggerService) {
  return (logs: HypertuneLogs) => {
    const {
      messageList = [],
      eventList = [],
      exposureList = [],
      evaluationList = [],
    } = logs ?? {};

    // Core SDK messages
    for (const msg of messageList) {
      const level = (msg.level ?? '').toLowerCase();
      const meta = msg.metadata ?? {};

      switch (level) {
        case 'trace':
          logger.trace(msg.message, meta);
          break;
        case 'debug':
          logger.debug(msg.message, meta);
          break;
        case 'info':
          logger.info(msg.message, meta);
          break;
        case 'warn':
        case 'warning':
          logger.warn(msg.message, meta);
          break;
        case 'error':
          logger.error(msg.message, meta);
          break;
        case 'fatal':
          logger.fatal(msg.message, meta);
          break;
        default:
          logger.info(msg.message, { ...meta, _unknownLevel: msg.level });
          break;
      }
    }

    // Analytics events
    for (const event of eventList) {
      logger.audit('Hypertune analytics event', { event });
    }

    // Experiment exposures
    for (const exposure of exposureList) {
      logger.audit('Hypertune experiment exposure', { exposure });
    }

    // Flag evaluations (very chatty -> trace)
    for (const evaluation of evaluationList) {
      logger.trace('Hypertune flag evaluation', { evaluation });
    }
  };
}

// ----------------------------------------------------
// Hypertune Module
// ----------------------------------------------------
@Global()
@Module({
  providers: [
    {
      provide: HYPERTUNE_SOURCE, // resolves as 'HYPERTUNE'
      useFactory: (): SourceNode => {
        const logger = new LoggerService({
          serviceName: 'user-service',
          environment: process.env.NODE_ENV ?? 'development',
          // Lowest level so we see EVERYTHING from Hypertune
          minLevel: 'trace',
          enableConsole: true,
          lokiEndpoint: process.env.LOKI_ENDPOINT ?? undefined,
          defaultLabels: {
            component: 'Hypertune',
          },
        });

        const token = resolveHypertuneToken();

        if (!token) {
          logger.warn('Hypertune token missing – using emptySource', {
            hasHYPERTUNE_TOKEN: !!process.env.HYPERTUNE_TOKEN,
            has_PUBLIC_TOKEN: !!process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN,
          });

          return emptySource;
        }

        const remoteLogging = resolveRemoteLogging();

        logger.info('Initializing Hypertune source for user-service', {
          remoteLogging,
        });

        return createSourceForServerOnly({
          token,
          key: 'nest-user-service',
          remoteLogging,
          // Hypertune SDK local logs hook -> Helix logger
          logsHandler: makeLogsHandler(logger),
        } as any);
      },
    },
  ],
  exports: [HYPERTUNE_SOURCE],
})
export class HypertuneModule {}
