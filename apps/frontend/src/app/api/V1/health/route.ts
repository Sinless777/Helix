// app/api/V1/health/route.ts
import { NextResponse, type NextRequest } from 'next/server';

/** Force dynamic – health should never be prerendered or cached by Next */
export const dynamic = 'force-dynamic';
/** Disable ISR */
export const revalidate = 0;
/** Use Node runtime for process info */
export const runtime = 'nodejs';

const startedAt = Date.now();

type CheckStatus = 'ok' | 'fail' | 'skip';
type CheckResult = {
  name: string;
  status: CheckStatus;
  latencyMs?: number;
  error?: string;
};

async function basicChecks(): Promise<CheckResult[]> {
  return [
    {
      name: 'env:VERSION',
      status: process.env.VERSION ? 'ok' : 'skip',
    },
  ];
}

async function deepChecks(): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];

  // Example template (disabled):
  // const t0 = Date.now()
  // try {
  //   await db.ping()
  //   checks.push({ name: 'database', status: 'ok', latencyMs: Date.now() - t0 })
  // } catch (err) {
  //   const message = err instanceof Error ? err.message : 'Unknown error'
  //   checks.push({ name: 'database', status: 'fail', error: message, latencyMs: Date.now() - t0 })
  // }

  // No real deps wired yet
  checks.push({ name: 'database', status: 'skip' });
  return checks;
}

function getBuildMeta() {
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || process.env.GIT_SHA || 'unknown';

  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'unknown';

  const region =
    process.env.VERCEL_REGION ||
    process.env.FLY_REGION ||
    process.env.AWS_REGION ||
    process.env.GOOGLE_CLOUD_REGION ||
    'unknown';

  return { commit, branch, region };
}

function getRequestInfo(req: NextRequest | Request) {
  const url = new URL(req.url);
  const xfwd = req.headers.get('x-forwarded-for') || '';
  const ip = xfwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return { url: url.toString(), ip, userAgent };
}

function getProcessMetrics() {
  const uptimeSeconds =
    typeof process.uptime === 'function'
      ? Math.floor(process.uptime())
      : Math.floor((Date.now() - startedAt) / 1000);

  const mem = typeof process.memoryUsage === 'function' ? process.memoryUsage() : undefined;

  return {
    uptimeSeconds,
    memory: mem
      ? {
          rss: mem.rss,
          heapTotal: mem.heapTotal,
          heapUsed: mem.heapUsed,
          external: mem.external,
        }
      : null,
  };
}

function withNoCache(headers = new Headers()) {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return headers;
}

function withCors(headers = new Headers()) {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}

function json(data: unknown, init?: number | ResponseInit) {
  const headers = withCors(
    withNoCache(new Headers(typeof init === 'number' ? undefined : init?.headers))
  );
  const base = typeof init === 'number' ? { status: init } : (init ?? {});
  return NextResponse.json(data, { ...base, headers });
}

function summarize(checks: CheckResult[]) {
  return checks.reduce<Record<CheckStatus, number>>(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { ok: 0, fail: 0, skip: 0 }
  );
}

function uuid(): string {
  // Typed, no `any`
  const c = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** GET /api/V1/health?checks=basic|deep */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const checksParam = (url.searchParams.get('checks') || 'basic').toLowerCase();
  const wantDeep = checksParam === 'deep';

  const [basic, deep] = await Promise.all([
    basicChecks(),
    wantDeep ? deepChecks() : Promise.resolve<CheckResult[]>([]),
  ]);
  const checks = [...basic, ...deep];
  const counts = summarize(checks);

  const hasFailure = checks.some((c) => c.status === 'fail');
  const statusCode = hasFailure ? 503 : 200;

  const meta = getBuildMeta();
  const reqInfo = getRequestInfo(request);
  const proc = getProcessMetrics();

  return json(
    {
      status: hasFailure ? 'error' : 'ok',
      message: { text: hasFailure ? 'API unhealthy' : 'API is healthy' },
      timestamp: new Date().toISOString(),
      service: 'helix-web-api',
      version: process.env.VERSION || 'unknown',
      env: process.env.NODE_ENV || 'development',
      git: meta,
      region: meta.region,
      request: { id: uuid(), ...reqInfo },
      metrics: proc,
      checks,
      counts,
    },
    statusCode
  );
}

/** HEAD – fast, tiny, uncached */
export async function HEAD() {
  const headers = withCors(withNoCache(new Headers()));
  return new NextResponse(null, { status: 200, headers });
}

/** OPTIONS – CORS preflight */
export async function OPTIONS() {
  const headers = withCors(withNoCache(new Headers()));
  return new NextResponse(null, { status: 204, headers });
}
