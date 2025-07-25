import { nodes as contribNodes, edges as contribEdges } from './contributing'
import { nodes, edges } from './index'

describe('Developer Docs index exports', () => {
  it('should export nodes from contributing', () => {
    expect(nodes).toBe(contribNodes)
    expect(Array.isArray(nodes)).toBe(true)
  })

  it('should export edges from contributing', () => {
    expect(edges).toBe(contribEdges)
    expect(Array.isArray(edges)).toBe(true)
  })

  it('nodes and edges arrays should not be empty', () => {
    expect(nodes.length).toBeGreaterThan(0)
    expect(edges.length).toBeGreaterThan(0)
  })
})
