// apps/UI/frontend/src/app/devcycle.ts
import { cookies } from 'next/headers'
import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { createClient as createEdgeClient } from '@vercel/edge-config'
import { EdgeConfigSource } from '@devcycle/vercel-edge-config'

type JSONPrimitive = string | number | boolean | null
type JSONValue = JSONPrimitive | { [k: string]: JSONValue } | JSONValue[]

export type GetVariableValue = <T extends JSONValue = JSONValue>(
  key: string,
  defaultValue: T,
  options?: Record<string, unknown>
) => Promise<T>
export type GetClientContext = () => Promise<unknown>

// Keep the edge source optional (no error during local builds)
const edgeConfigConn = process.env.EDGE_CONFIG
const edgeOptions = edgeConfigConn
  ? { configSource: new EdgeConfigSource(createEdgeClient(edgeConfigConn)) }
  : undefined

async function getUserIdentity() {
  const jar = await cookies()
  const id = jar.get('dvc_id')?.value ?? crypto.randomUUID()
  return { user_id: id }
}

// Provide a portable facade type so TS never tries to name DevCycle internals
type DVCFacade = {
  getVariableValue: GetVariableValue
  getClientContext: GetClientContext
  getAllVariables: () => Promise<unknown>
  getAllFeatures: () => Promise<unknown>
}

const dvc = setupDevCycle({
  serverSDKKey: process.env.DEVCYCLE_SERVER_SDK_KEY ?? '',
  clientSDKKey: process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? '',
  userGetter: getUserIdentity,
  ...(edgeOptions ? { options: edgeOptions } : {}),
}) as unknown as DVCFacade

// Re-exports (typed against our portable aliases)
export const getVariableValue: GetVariableValue = dvc.getVariableValue
export const getClientContext: GetClientContext = dvc.getClientContext
