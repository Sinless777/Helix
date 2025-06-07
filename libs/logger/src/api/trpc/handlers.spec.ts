import { createContext } from './context'
import { IncomingMessage, ServerResponse } from 'http'
import { DriverBase } from '../../lib/DriverBase'
import { RouteRule } from '../../types/RouteRule'

describe('createContext', () => {
  it('should create a context with the provided request, response, drivers, and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse
    const drivers: Record<string, DriverBase> = {
      driver1: {} as DriverBase,
      driver2: {} as DriverBase,
    }
    const rules: RouteRule[] = [
      {
        id: 'rule1',
        enabled: true,
        description: 'Test rule 1',
        drivers: ['driver1'],
      },
      {
        id: 'rule2',
        enabled: false,
        description: 'Test rule 2',
        drivers: ['driver2'],
      },
    ]

    const context = await createContext({ req, res, drivers, rules })
    expect(context).toEqual({ req, res, drivers, rules })
  })

  it('should handle empty drivers and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse
    const drivers: Record<string, DriverBase> = {}
    const rules: RouteRule[] = []

    const context = await createContext({ req, res, drivers, rules })
    expect(context).toEqual({ req, res, drivers, rules })
  })

  it('should handle undefined drivers and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    // coerce to any to allow missing properties
    const context = await createContext({
      req,
      res,
      drivers: undefined as any,
      rules: undefined as any,
    })
    expect(context).toEqual({ req, res, drivers: {}, rules: [] })
  })

  it('should handle null drivers and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    const context = await createContext({
      req,
      res,
      drivers: null as any,
      rules: null as any,
    })
    expect(context).toEqual({ req, res, drivers: {}, rules: [] })
  })

  it('should throw an error if req or res is missing', async () => {
    await expect(
      // @ts-expect-error missing req/res
      createContext({ drivers: {}, rules: [] }),
    ).rejects.toThrow('req and res are required')
  })

  it('should throw an error if drivers is not an object', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    await expect(
      createContext({ req, res, drivers: 'nope' as any, rules: [] }),
    ).rejects.toThrow('drivers must be an object')
  })

  it('should throw an error if rules is not an array', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    await expect(
      createContext({ req, res, drivers: {}, rules: 'nope' as any }),
    ).rejects.toThrow('rules must be an array')
  })

  it('should throw an error if rules contain invalid rule objects', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    await expect(
      createContext({
        req,
        res,
        drivers: {},
        rules: [
          {
            /* missing id, enabled, etc */
          },
        ] as any,
      }),
    ).rejects.toThrow(
      'Each rule must have id, enabled, description, and drivers',
    )
  })
})
