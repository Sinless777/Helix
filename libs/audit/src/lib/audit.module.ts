import {
  DynamicModule,
  Global,
  Module,
  Provider,
  ModuleMetadata,
} from '@nestjs/common'

import {
  AUDIT_CONTEXT,
  AUDIT_CONTEXT_EXTRACTOR,
  AUDIT_MODULE_OPTIONS,
  AUDIT_ENABLED_DEFAULT,
  DEFAULT_REDACT_KEYS,
  DEFAULT_REDACT_QUERY_PARAMS,
  REDACT_REPLACEMENT,
  INCLUDE_REQUEST_BODY_DEFAULT,
  INCLUDE_RESPONSE_BODY_DEFAULT,
  MAX_DIFF_BYTES,
} from './constants'

import type { AuditModuleOptions } from './constants'
import { AuditService } from './audit.service'
import {
  AuditContextExtractorProvider,
  AuditContextProvider,
  DefaultAuditContextExtractor,
} from './providers/audit-context.provider'

@Global()
@Module({
  providers: [
    // Default (override via forRoot/forRootAsync)
    {
      provide: AUDIT_MODULE_OPTIONS,
      useValue: defaultAuditOptions(),
    },
    AuditService,
    AuditContextExtractorProvider, // provides AUDIT_CONTEXT_EXTRACTOR
    AuditContextProvider, // request-scoped AUDIT_CONTEXT
  ],
  exports: [
    AuditService,
    AUDIT_MODULE_OPTIONS,
    AUDIT_CONTEXT_EXTRACTOR,
    AUDIT_CONTEXT,
  ],
})
export class AuditModule {
  /**
   * Register with static options.
   */
  static forRoot(options: AuditModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: AUDIT_MODULE_OPTIONS,
      useValue: withDefaults(options),
    }

    return {
      module: AuditModule,
      providers: [optionsProvider],
      exports: [optionsProvider],
    }
  }

  /**
   * Register with async/factory options.
   */
  static forRootAsync(options: AuditModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: AUDIT_MODULE_OPTIONS,
      useFactory: async (...args: any[]) =>
        withDefaults(await options.useFactory(...args)),
      inject: options.inject ?? [],
    }

    return {
      module: AuditModule,
      imports: options.imports ?? [],
      providers: [asyncProvider],
      exports: [asyncProvider],
    }
  }
}

// ───────────────────────────── Types & helpers ─────────────────────────────

export interface AuditModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<AuditModuleOptions> | AuditModuleOptions
  inject?: any[]
}

function defaultAuditOptions(): AuditModuleOptions {
  return {
    enabled: AUDIT_ENABLED_DEFAULT,
    redactKeys: [...DEFAULT_REDACT_KEYS],
    redactQueryParams: [...DEFAULT_REDACT_QUERY_PARAMS],
    redactReplacement: REDACT_REPLACEMENT,
    includeRequestBody: INCLUDE_REQUEST_BODY_DEFAULT,
    includeResponseBody: INCLUDE_RESPONSE_BODY_DEFAULT,
    maxDiffBytes: MAX_DIFF_BYTES,
  }
}

function withDefaults(opts: AuditModuleOptions): AuditModuleOptions {
  const d = defaultAuditOptions()
  return {
    enabled: opts.enabled ?? d.enabled,
    redactKeys: opts.redactKeys ?? d.redactKeys,
    redactQueryParams: opts.redactQueryParams ?? d.redactQueryParams,
    redactReplacement: opts.redactReplacement ?? d.redactReplacement,
    includeRequestBody: opts.includeRequestBody ?? d.includeRequestBody,
    includeResponseBody: opts.includeResponseBody ?? d.includeResponseBody,
    maxDiffBytes: opts.maxDiffBytes ?? d.maxDiffBytes,
  }
}

// Optional re-exports for convenience (so consumers can customize easily)
export { AuditService, DefaultAuditContextExtractor }
