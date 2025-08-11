// app/devcycle.ts
import { cookies } from 'next/headers'
import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { createClient as createEdgeClient } from '@vercel/edge-config'
import { EdgeConfigSource } from '@devcycle/vercel-edge-config'

// --- Portable helper types (avoid referencing @devcycle/types directly) ---
type JSONPrimitive = string | number | boolean | null
type JSONValue = JSONPrimitive | { [k: string]: JSONValue } | JSONValue[]

// Returned helpers' public shapes
export type GetVariableValue = <T extends JSONValue = JSONValue>(
  key: string,
  defaultValue: T,
  options?: Record<string, unknown>
) => Promise<T>
export type GetClientContext = () => Promise<unknown>
// -------------------------------------------------------------------------

const edgeConfig = new EdgeConfigSource(createEdgeClient(process.env.EDGE_CONFIG!))

async function getUserIdentity() {
  const jar = cookies() // not async
  let id = (await jar).get('dvc_id')?.value
  if (!id) id = crypto.randomUUID() // fallback for local/dev
  return { user_id: id }
}

const dvc = setupDevCycle({
  serverSDKKey: process.env.DEVCYCLE_SERVER_SDK_KEY ?? '',
  clientSDKKey: process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? '',
  userGetter: getUserIdentity,
  options: { configSource: edgeConfig },
})

// Explicit, portable annotations prevent TS2742
export const getVariableValue: GetVariableValue =
  dvc.getVariableValue as unknown as GetVariableValue

export const getClientContext: GetClientContext =
  dvc.getClientContext as unknown as GetClientContext
