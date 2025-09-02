// libs/core/src/lib/types/form.ts

/* -----------------------------------------------------------------------------
 * Primitive Brands
 * ---------------------------------------------------------------------------*/

export type UUID = string & { readonly __brand: 'UUID' }
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' }

/* -----------------------------------------------------------------------------
 * Core Form Structures
 * ---------------------------------------------------------------------------*/

/**
 * Supported field types across Helix AI form system.
 */
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'url'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'switch'
  | 'slider'
  | 'color'
  | 'rating'
  | 'markdown'

/**
 * Shared validation rules for inputs.
 */
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string | RegExp
  min?: number | string
  max?: number | string
  /** Custom function rule; return true if valid, string error otherwise */
  validate?: (value: unknown) => true | string
}

/**
 * Base field properties.
 */
export interface BaseField<T = unknown> {
  id: string
  label: string
  type: FormFieldType
  placeholder?: string
  description?: string
  defaultValue?: T
  disabled?: boolean
  hidden?: boolean
  validation?: ValidationRule
  /** Grouping information for advanced UIs */
  section?: string
  /** Icon or visual indicator */
  icon?: string
}

/**
 * Specific options for select/multi/radio fields.
 */
export interface FieldOption {
  value: string
  label: string
  icon?: string
  description?: string
  disabled?: boolean
}

/**
 * Rich field definition, with options for certain types.
 */
export interface FormField<T = unknown> extends BaseField<T> {
  options?: FieldOption[]
  multiple?: boolean // for multiselect/checkbox groups
}

/* -----------------------------------------------------------------------------
 * Form Metadata & Schema
 * ---------------------------------------------------------------------------*/

export interface FormMeta {
  id: UUID
  title: string
  description?: string
  createdAt: IsoDateTime
  updatedAt?: IsoDateTime
  ownerId: UUID
  version?: string
  tags?: string[]
}

export interface FormSchema {
  meta: FormMeta
  fields: FormField[]
}

/* -----------------------------------------------------------------------------
 * Submissions
 * ---------------------------------------------------------------------------*/

export interface FormAnswer<T = unknown> {
  fieldId: string
  value: T
}

export interface FormSubmission {
  id: UUID
  formId: UUID
  submittedAt: IsoDateTime
  submittedBy?: UUID
  answers: FormAnswer[]
  metadata?: Record<string, string | number | boolean>
}

/* -----------------------------------------------------------------------------
 * Utilities
 * ---------------------------------------------------------------------------*/

/** A partial submission draft (e.g. while user is still editing). */
export interface FormDraft {
  formId: UUID
  answers: Partial<Record<string, unknown>>
  lastSavedAt?: IsoDateTime
}

/** Discriminated union of form lifecycle events. */
export type FormEvent =
  | { type: 'form.created'; form: FormSchema }
  | { type: 'form.updated'; form: FormSchema }
  | { type: 'form.deleted'; formId: UUID }
  | { type: 'form.submitted'; submission: FormSubmission }
  | { type: 'form.draft.saved'; draft: FormDraft }
