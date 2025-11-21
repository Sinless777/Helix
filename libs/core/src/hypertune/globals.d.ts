// libs/hypertune/src/globals.d.ts
declare global {
  interface Window {
    __HYPERTUNE__?: Record<string, unknown>;
  }
}
export {};
