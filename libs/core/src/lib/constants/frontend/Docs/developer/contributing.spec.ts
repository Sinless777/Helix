import { Node, Edge } from 'react-flow-renderer'
import { nodes, edges } from './contributing'

describe('Git Flow diagram constants', () => {
  describe('nodes array', () => {
    it('should be an array of Node objects', () => {
      expect(Array.isArray(nodes)).toBe(true)
      nodes.forEach((node: Node) => {
        expect(typeof node.id).toBe('string')
        expect(node.data).toHaveProperty('label')
        expect(typeof node.data.label).toBe('string')
        expect(node.position).toHaveProperty('x')
        expect(typeof node.position.x).toBe('number')
        expect(node.position).toHaveProperty('y')
        expect(typeof node.position.y).toBe('number')
        expect(node.style).toBeDefined()
        expect(typeof node.style).toBe('object')
      })
    })

    it('should contain the correct number of nodes', () => {
      expect(nodes).toHaveLength(6)
    })
  })

  describe('edges array', () => {
    it('should be an array of Edge objects', () => {
      expect(Array.isArray(edges)).toBe(true)
      edges.forEach((edge: Edge) => {
        expect(typeof edge.id).toBe('string')
        expect(typeof edge.source).toBe('string')
        expect(typeof edge.target).toBe('string')
        expect(typeof edge.type).toBe('string')
        expect(edge.style).toBeDefined()
        expect(typeof edge?.style?.stroke).toBe('string')
        expect(typeof edge?.style?.strokeWidth).toBe('number')
        expect(typeof edge?.style?.strokeDasharray).toBe('string')
      })
    })

    it('should contain the correct number of edges', () => {
      expect(edges).toHaveLength(6)
    })
  })

  it('matches the snapshot for nodes and edges', () => {
    expect(nodes).toMatchSnapshot('contributing-nodes')
    expect(edges).toMatchSnapshot('contributing-edges')
  })
})
