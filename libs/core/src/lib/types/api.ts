// libs/core/src/lib/constants/types/api.ts

import type { KnownErrorCode } from '../Errors/errors'

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    requestId?: string
    timestamp?: string
    [key: string]: unknown
  }
}

/**
 * Standardized error payload for APIs
 */
export interface ApiError {
  code: KnownErrorCode | number
  message: string
  details?: unknown
  path?: string // which route or subsystem triggered it
  hint?: string // optional human-readable fix suggestion
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

/**
 * Common API request wrapper
 */
export interface PaginatedRequest {
  page?: number
  perPage?: number
  filters?: Record<string, unknown>
  sort?: string
}

/**
 * Common API response with pagination
 */
export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  pagination: PaginationMeta
}>
