// apps/UI/frontend/src/app/api/dvc-flag/route.ts
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { initializeDevCycle } from '@devcycle/js-cloud-server-sdk'

const dvc = initializeDevCycle(process.env.DEVCYCLE_SERVER_SDK_KEY!)

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key')!
  const user_id = req.headers.get('x-dvc-id') ?? 'anon'
  const value = await dvc.variableValue({ user_id }, key, false)
  return Response.json({ value })
}
