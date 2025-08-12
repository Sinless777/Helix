// app/devcycle.ts
import { cookies } from 'next/headers'
import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { createClient as createEdgeClient } from '@vercel/edge-config'
import { EdgeConfigSource } from '@devcycle/vercel-edge-config'

// … your JSON* types …

const edgeConfigConn = process.env.EDGE_CONFIG
const edgeOptions =
  edgeConfigConn
    ? { configSource: new EdgeConfigSource(createEdgeClient(edgeConfigConn)) }
    : undefined

async function getUserIdentity() {
  const jar = await cookies()
  const id = jar.get('dvc_id')?.value ?? crypto.randomUUID()
  return { user_id: id }
}

const dvc = setupDevCycle({
  serverSDKKey: process.env.DEVCYCLE_SERVER_SDK_KEY ?? '',
  clientSDKKey: process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? '',
  userGetter: getUserIdentity,
  // only pass options if we actually have them
  ...(edgeOptions ? { options: edgeOptions } : {}),
})

// Re-exports
export const getVariableValue = dvc.getVariableValue as any
export const getClientContext = dvc.getClientContext as any
