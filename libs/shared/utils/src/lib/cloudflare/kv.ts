export type KvNamespaceLike = {
  get: (key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream') => Promise<any>;
  put: (key: string, value: string | ReadableStream, options?: unknown) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

export const createKvClient = (ns: KvNamespaceLike) => ({
  get: ns.get.bind(ns),
  put: ns.put.bind(ns),
  delete: ns.delete.bind(ns),
});
