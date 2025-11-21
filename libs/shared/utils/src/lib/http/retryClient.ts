import got, { type Got } from 'got';

export type RetryClientOptions = {
  baseUrl?: string;
  retries?: number;
  timeoutMs?: number;
};

export const createRetryClient = (opts: RetryClientOptions = {}): Got =>
  got.extend({
    prefixUrl: opts.baseUrl,
    retry: { limit: opts.retries ?? 3, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
    timeout: { request: opts.timeoutMs ?? 15_000 },
    throwHttpErrors: false,
  });

export const retryClient = createRetryClient();
