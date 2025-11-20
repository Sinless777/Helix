// apps/services/user/src/app/app.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  Context,
  Environment,
  EnvironmentEnumValues,
  Root,
  RootNode,
  SourceNode,
  flagFallbacks,
} from '@helix-ai/hypertune/hypertune';
import { HYPERTUNE_SOURCE } from './hypertune.module';

const DEFAULT_ENVIRONMENT: Environment = 'development';

// Use the generated flag fallbacks as our default Root value
const DEFAULT_FLAGS: Root = { ...flagFallbacks };

const DEFAULT_CONTEXT: Context = {
  environment: DEFAULT_ENVIRONMENT,
  user: {
    id: 'system',
    name: 'system',
    email: 'system@helix.ai',
  },
};

function coerceEnvironment(
  value?: string | null,
  fallback: Environment = DEFAULT_ENVIRONMENT,
): Environment {
  if (!value) return fallback;

  const match = EnvironmentEnumValues.find((env) => env === value);
  return (match ?? fallback) as Environment;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(HYPERTUNE_SOURCE)
    private readonly hypertune: SourceNode,
  ) {}

  /**
   * Basic service status + current Hypertune flags.
   */
  getStatus() {
    const env = process.env.NODE_ENV ?? 'development';
    const hypertuneAttached = Boolean(this.hypertune);

    this.logger.debug('Status requested', {
      env,
      hypertuneAttached,
    });

    const root = this.readRootFlags();

    return {
      ok: true,
      environment: env,
      hypertuneAttached,
      permissionsSystem: root.permissionsSystem,
      rootFlags: root,
    };
  }

  /**
   * Read all flags from the Hypertune `root` object using the generated
   * RootNode.get() helper. Falls back to DEFAULT_FLAGS on any failure.
   */
  private readRootFlags(): Root {
    this.logger.debug('Reading Hypertune root flags...');

    if (!this.hypertune) {
      this.logger.warn(
        'Hypertune SourceNode is not available; using DEFAULT_FLAGS.',
      );
      return DEFAULT_FLAGS;
    }

    const context = this.buildContext();
    this.logger.debug('Hypertune context', { context });

    let rootNode: RootNode;

    try {
      // IMPORTANT: call as a method on the instance so `this` is bound correctly.
      rootNode = this.hypertune.root({ args: { context } });
    } catch (err) {
      this.logger.error(
        'Error creating Hypertune RootNode; using DEFAULT_FLAGS.',
        err instanceof Error ? err.stack : String(err),
      );
      return DEFAULT_FLAGS;
    }

    if (!rootNode || typeof rootNode.get !== 'function') {
      this.logger.warn(
        'Hypertune RootNode.get is not available; using DEFAULT_FLAGS.',
      );
      return DEFAULT_FLAGS;
    }

    try {
      const flags = rootNode.get({ fallback: DEFAULT_FLAGS });
      this.logger.debug('Hypertune root flags resolved', { flags });
      return flags;
    } catch (err) {
      this.logger.error(
        'Error resolving Hypertune root flags; using DEFAULT_FLAGS.',
        err instanceof Error ? err.stack : String(err),
      );
      return DEFAULT_FLAGS;
    }
  }

  /**
   * Build the Hypertune context from environment variables.
   * This must match the logic you use in the Hypertune UI
   * (e.g. environment targeting, user attributes, etc.).
   */
  private buildContext(): Context {
    const hypertuneEnv = coerceEnvironment(
      process.env.HYPERTUNE_ENVIRONMENT,
      coerceEnvironment(process.env.NODE_ENV),
    );

    const context: Context = {
      ...DEFAULT_CONTEXT,
      environment: hypertuneEnv,
    };

    return context;
  }
}
