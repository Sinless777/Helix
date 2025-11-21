// apps/frontend/src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authConfig } from '@helix-ai/config';

// Create the NextAuth handler (App Router style: single handler function)
const handler = NextAuth(authConfig);

/**
 * Decide whether the permissions system is enabled.
 *
 * For now this is purely env-based so the route can't crash if Hypertune wiring is off.
 * You can reintroduce Hypertune here once your @helix-ai/hypertune helper matches
 * the official next-app router pattern.
 */
function isPermissionsSystemEnabled(): boolean {
  const override =
    process.env.PERMISSIONS_SYSTEM_ENABLED ??
    process.env.NEXT_PUBLIC_PERMISSIONS_SYSTEM_ENABLED;

  if (override !== undefined) {
    return override === 'true' || override === '1';
  }

  // Default: enabled outside production, disabled only if explicitly turned off
  return process.env.NODE_ENV !== 'production';
}

/**
 * Route gate: only expose NextAuth when the permissions system flag is enabled.
 */
async function gatedHandler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } },
) {
  const enabled = isPermissionsSystemEnabled();

  if (!enabled) {
    // Pretend the route doesn't exist when permissions are off
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // Delegate to the official NextAuth handler (handles GET/POST/etc internally)
  return handler(req, ctx as any);
}

export async function GET(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } },
) {
  return gatedHandler(req, ctx);
}

export async function POST(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } },
) {
  return gatedHandler(req, ctx);
}
