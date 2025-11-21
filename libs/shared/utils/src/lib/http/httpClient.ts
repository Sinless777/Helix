import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

export type HttpClientOptions = {
  baseURL?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

export const createHttpClient = (opts: HttpClientOptions = {}): AxiosInstance =>
  axios.create({
    baseURL: opts.baseURL,
    timeout: opts.timeoutMs ?? 15_000,
    headers: opts.headers,
    validateStatus: () => true,
  });

export type HttpResponse<T = unknown> = AxiosResponse<T>;

export const httpClient = createHttpClient();
