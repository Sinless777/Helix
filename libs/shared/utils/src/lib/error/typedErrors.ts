export class TypedError<TCode extends string = string> extends Error {
  constructor(public code: TCode, message: string, public meta?: Record<string, unknown>) {
    super(message);
    this.name = `TypedError:${code}`;
  }
}

export const isTypedError = <TCode extends string = string>(
  err: unknown,
  code?: TCode,
): err is TypedError<TCode> =>
  err instanceof TypedError && (code ? err.code === code : true);
