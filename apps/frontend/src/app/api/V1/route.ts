// apps/frontend/src/app/api/V1/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // You can parse query parameters like: request.nextUrl.searchParams.get('foo')
    const data = {
      status: 'ok',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API V1 GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

