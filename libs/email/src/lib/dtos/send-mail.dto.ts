// libs/email/src/lib/dtos/send-mail.dto.ts
// -----------------------------------------------------------------------------
// SendMail DTO (validated + normalized)
// - Avoids hard-coupling to types by deriving from normalizeAddress()
// -----------------------------------------------------------------------------

import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty,
  IsMimeType,
  IsHash,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions
} from 'class-validator'
import { Transform, Type } from 'class-transformer'

import { normalizeAddress } from '../utils/address.util'

// Derive stable types from the util to avoid import/rename drift.
type EmailAddress = ReturnType<typeof normalizeAddress>
type AddressLike = Parameters<typeof normalizeAddress>[0]
type AddressListLike = AddressLike | AddressLike[] | string[]

// Local helper since the util doesn't export one.
function normalizeAddressList(value?: AddressListLike): EmailAddress[] {
  if (value == null) return []
  const arr = Array.isArray(value) ? value : [value]
  return arr
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .map((v) => normalizeAddress(v))
    .filter((a): a is EmailAddress => !!a.address)
}

/* -----------------------------------------------------------------------------
 * Custom validator: require at least one of the body fields
 * -------------------------------------------------------------------------- */
function AtLeastOne(
  properties: (keyof SendMailDto)[],
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'AtLeastOne',
      target: object.constructor,
      propertyName,
      constraints: [properties],
      options: {
        message:
          validationOptions?.message ??
          `Provide at least one of: ${properties.join(', ')}`,
        ...validationOptions
      },
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const [props] = args.constraints as [(keyof SendMailDto)[]]
          return props.some((p) => {
            const v = (args.object as any)[p]
            if (Array.isArray(v)) return v.length > 0
            return v !== undefined && v !== null && String(v).trim().length > 0
          })
        }
      }
    })
  }
}

/* -----------------------------------------------------------------------------
 * Attachments DTO
 * -------------------------------------------------------------------------- */
export class AttachmentDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  filename?: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsString()
  path?: string

  @IsOptional()
  @IsString()
  @Length(1, 255)
  cid?: string

  @IsOptional()
  @IsString()
  @IsMimeType()
  contentType?: string

  @IsOptional()
  @IsString()
  encoding?: string

  @IsOptional()
  @IsIn(['inline', 'attachment'])
  disposition?: 'inline' | 'attachment'

  @IsOptional()
  @IsHash('sha256')
  sha256?: string
}

/* -----------------------------------------------------------------------------
 * Template DTO
 * -------------------------------------------------------------------------- */
export class TemplateDto {
  @IsString()
  @Length(1, 128)
  name!: string

  @IsOptional()
  @IsIn(['mjml', 'react', 'handlebars', 'nunjucks', 'raw'])
  engine?: 'mjml' | 'react' | 'handlebars' | 'nunjucks' | 'raw'

  @IsOptional()
  @IsObject()
  props?: object
}

/* -----------------------------------------------------------------------------
 * Main DTO
 * -------------------------------------------------------------------------- */
export class SendMailDto {
  @IsOptional()
  @Transform(({ value }) =>
    value ? normalizeAddress(value as AddressLike) : undefined
  )
  from?: EmailAddress

  @Transform(({ value }) => normalizeAddressList(value as AddressListLike))
  @IsArray()
  @ArrayMinSize(1)
  to!: EmailAddress[]

  @IsOptional()
  @Transform(({ value }) =>
    value ? normalizeAddressList(value as AddressListLike) : undefined
  )
  @IsArray()
  cc?: EmailAddress[]

  @IsOptional()
  @Transform(({ value }) =>
    value ? normalizeAddressList(value as AddressListLike) : undefined
  )
  @IsArray()
  bcc?: EmailAddress[]

  @IsOptional()
  @Transform(({ value }) =>
    value ? normalizeAddress(value as AddressLike) : undefined
  )
  replyTo?: EmailAddress

  @IsString()
  @IsNotEmpty()
  subject!: string

  @IsOptional()
  @IsString()
  text?: string

  @IsOptional()
  @IsString()
  html?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateDto)
  template?: TemplateDto

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsArray()
  attachments?: AttachmentDto[]

  @AtLeastOne(['text', 'html', 'template'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _bodyGuard?: true
}

/* -----------------------------------------------------------------------------
 * Normalized outbound type (after class-transformer)
 * -------------------------------------------------------------------------- */
export type NormalizedSendMail = Omit<
  SendMailDto,
  'from' | 'to' | 'cc' | 'bcc' | 'replyTo'
> & {
  from?: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress
}
