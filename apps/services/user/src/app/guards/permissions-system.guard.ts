// apps/services/user/src/app/guards/permissions-system.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  SourceNode,
  RootNode,
  Context,
  Environment,
  EnvironmentEnumValues,
} from '@helix-ai/core/hypertune/hypertune';
import { HYPERTUNE_SOURCE } from '../hypertune.module';

const DEFAULT_ENVIRONMENT: Environment = 'development';

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

/**
 * Guard that gates auth-related endpoints behind the
 * Hypertune `root.permissionsSystem` flag.
 *
 * - permissionsSystem === true  -> allow
 * - permissionsSystem === false -> 404 (feature disabled)
 */
@Injectable()
export class PermissionsSystemGuard implements CanActivate {
  constructor(
    @Inject(HYPERTUNE_SOURCE)
    private readonly hypertune: SourceNode,
  ) {}

  canActivate(_context: ExecutionContext): boolean {
    const enabled = this.isPermissionsSystemEnabled();

    if (enabled) {
      return true;
    }

    // You can switch this to ForbiddenException for 403 if you prefer.
    throw new NotFoundException(
      'Signup and login are currently disabled by configuration.',
    );
  }

  private isPermissionsSystemEnabled(): boolean {
    const rootFactory = this.hypertune?.root;

    if (typeof rootFactory !== 'function') {
      // Hypertune not available -> fail closed
      return false;
    }

    const ctx = this.buildContext();

    let rootNode: RootNode;
    try {
      // SourceNode.root expects: { args: RootArgs }
      rootNode = rootFactory({ args: { context: ctx } });
    } catch {
      return false;
    }

    if (!rootNode || typeof rootNode.permissionsSystem !== 'function') {
      return false;
    }

    try {
      // Ask Hypertune for the flag; default to false on any error
      return rootNode.permissionsSystem({ fallback: false });
    } catch {
      return false;
    }
  }

  private buildContext(): Context {
    const hypertuneEnv = coerceEnvironment(
      process.env.HYPERTUNE_ENVIRONMENT,
      coerceEnvironment(process.env.NODE_ENV),
    );

    return {
      ...DEFAULT_CONTEXT,
      environment: hypertuneEnv,
    };
  }
}
