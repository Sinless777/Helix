import { Edge, Node } from 'react-flow-renderer'

// Branch nodes for the Git Flow diagram
export const nodes: Node[] = [
  {
    id: 'feature',
    data: { label: 'feature/*' },
    position: { x: 200, y: 50 },
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      width: 120,
      textAlign: 'center',
    },
  },
  {
    id: 'bugfix',
    data: { label: 'bugfix/*' },
    position: { x: 200, y: 150 },
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      width: 120,
      textAlign: 'center',
    },
  },
  {
    id: 'hotfix',
    data: { label: 'hotfix/*' },
    position: { x: 50, y: 300 },
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      width: 120,
      textAlign: 'center',
    },
  },
  {
    id: 'docs',
    data: { label: 'docs/*' },
    position: { x: 50, y: 400 },
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      width: 120,
      textAlign: 'center',
    },
  },
  {
    id: 'master',
    data: { label: 'master' },
    position: { x: 350, y: 300 },
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      width: 120,
      textAlign: 'center',
    },
  },
  {
    id: 'develop',
    data: { label: 'develop' },
    position: { x: 550, y: 300 },
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      width: 120,
      textAlign: 'center',
    },
  },
]

// Connections between branches
export const edges: Edge[] = [
  {
    id: 'e1-develop',
    source: 'feature',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e2-develop',
    source: 'bugfix',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e3-master',
    source: 'hotfix',
    target: 'master',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e3-develop',
    source: 'hotfix',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e4-develop',
    source: 'docs',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'e5-develop',
    source: 'master',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' },
  },
]
