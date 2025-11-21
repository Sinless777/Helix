export const nowMs = () => Date.now();
export const nowSeconds = () => Math.floor(Date.now() / 1000);
export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
export const toIso = (input: Date | number | string) => new Date(input).toISOString();
