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
        id: '1',
        enabled: true,
        description: 'd1',
        drivers: ['driver1'],
      },
      {
        id: '2',
        enabled: false,
        description: 'd2',
        drivers: ['driver2'],
      },
    ]

    const context = await createContext({ req, res, drivers, rules })
    expect(context).toEqual({
      req,
      res,
      drivers,
      rules,
    })
  })

  it('should handle empty drivers and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse
    const drivers: Record<string, DriverBase> = {}
    const rules: RouteRule[] = []

    const context = await createContext({ req, res, drivers, rules })
    expect(context).toEqual({
      req,
      res,
      drivers,
      rules,
    })
  })

  it('should handle undefined drivers and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    const context = await createContext({
      req,
      res,
      drivers: ['nope'] as any, // testing runtime behavior
      rules: [undefined] as any, // testing runtime behavior
    })
    expect(context).toEqual({
      req,
      res,
      drivers: {},
      rules: [],
    })
  })

  it('should handle null drivers and rules', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse

    const context = await createContext({
      req,
      res,
      drivers: ['nope'] as any, // testing runtime behavior
      rules: [undefined] as any, // testing runtime behavior
    })
    expect(context).toEqual({
      req,
      res,
      drivers: {},
      rules: [],
    })
  })

  it('should throw an error if req or res is missing', async () => {
    // @ts-expect-error missing req/res
    await expect(createContext({ drivers: {}, rules: [] })).rejects.toThrow(
      'req and res are required',
    )
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

  it('should throw on invalid rule objects', async () => {
    const req = {} as IncomingMessage
    const res = {} as ServerResponse
    // missing id/description etc.
    await expect(
      createContext({
        req,
        res,
        drivers: {},
        rules: [
          {
            drivers: [],
            id: '',
            enabled: false,
            description: '',
          },
        ],
      }),
    ).rejects.toThrow(
      'Each rule must have method, path, and handler properties',
    )
  })
})

const res = {} as ServerResponse
