// app/api/dvc-flag/route.ts
export const runtime = 'nodejs';

import { NextRequest } from 'next/server'
import { createClient as createEdgeClient } from '@vercel/edge-config'
import { EdgeConfigSource } from '@devcycle/vercel-edge-config'
import { initializeDevCycle } from '@devcycle/nodejs-server-sdk' // if this fails on Edge, switch this file to Node (remove runtime='edge')

const edgeConfig = new EdgeConfigSource(createEdgeClient(process.env.EDGE_CONFIG!))
const dvc = initializeDevCycle(process.env.DEVCYCLE_SERVER_SDK_KEY!, { configSource: edgeConfig })

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key')!
  const user_id = req.headers.get('x-dvc-id') ?? 'anon'
  const value = await dvc.variableValue({ user_id }, key, false)
  return Response.json({ value })
}
