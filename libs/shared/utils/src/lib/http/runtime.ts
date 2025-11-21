export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
export const isNode = typeof process !== 'undefined' && !!process.versions?.node;
export const isEdge = typeof (globalThis as any).EdgeRuntime !== 'undefined';

export const runtime = () => ({
  browser: isBrowser,
  node: isNode,
  edge: isEdge,
});
