// libs/core/src/lib/constants/Errors/index.ts
import type { errCodes, CollectCodes, CollectPaths } from './error.type.js'
import {
  ErrorCodes,
  type KnownErrorCode,
  type KnownErrorPath,
  getErrorCode,
  getErrorPathByCode,
  isKnownErrorCode
} from './errors.js'

export { ErrorCodes, getErrorCode, getErrorPathByCode, isKnownErrorCode }
export type {
  errCodes,
  KnownErrorCode,
  KnownErrorPath,
  CollectCodes,
  CollectPaths
}
