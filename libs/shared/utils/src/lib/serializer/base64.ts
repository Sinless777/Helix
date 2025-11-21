export const toBase64 = (data: string | Buffer): string =>
  Buffer.isBuffer(data) ? data.toString('base64') : Buffer.from(data, 'utf8').toString('base64');

export const fromBase64 = (data: string): Buffer => Buffer.from(data, 'base64');
