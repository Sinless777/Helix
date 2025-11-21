/**
 * Hypertune source helpers shared between UI and services.
 * This stays dependency-free; caller provides hypertune SDK.
 */

export type HypertuneClientFactory<T> = () => Promise<T> | T;

/**
 * Wrap a hypertune client factory to allow lazy construction.
 */
export function createHypertuneSource<T>(factory: HypertuneClientFactory<T>): () => Promise<T> {
  return async () => await factory();
}

/**
 * Return an empty stub source when hypertune is disabled.
 */
export const emptyHypertuneSource = async () => undefined;
