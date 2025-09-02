import type { FlowNodeData, FlowEdgeData } from '@helixai/core/lib/types/docs'

export const ContributingFlowNodes: FlowNodeData[] = [
  {
    id: 'feature',
    label: 'feature/*',
    position: { x: 200, y: 50 },
    width: 120,
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      textAlign: 'center'
    }
  },
  {
    id: 'bugfix',
    label: 'bugfix/*',
    position: { x: 200, y: 150 },
    width: 120,
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      textAlign: 'center'
    }
  },
  {
    id: 'hotfix',
    label: 'hotfix/*',
    position: { x: 50, y: 300 },
    width: 120,
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      textAlign: 'center'
    }
  },
  {
    id: 'docs',
    label: 'docs/*',
    position: { x: 50, y: 400 },
    width: 120,
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      textAlign: 'center'
    }
  },
  {
    id: 'master',
    label: 'master',
    position: { x: 350, y: 300 },
    width: 120,
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      textAlign: 'center'
    }
  },
  {
    id: 'develop',
    label: 'develop',
    position: { x: 550, y: 300 },
    width: 120,
    style: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 10,
      textAlign: 'center'
    }
  }
]

export const ContributingFlowEdges: FlowEdgeData[] = [
  {
    id: 'e1-develop',
    source: 'feature',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  {
    id: 'e2-develop',
    source: 'bugfix',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  {
    id: 'e3-master',
    source: 'hotfix',
    target: 'master',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  {
    id: 'e3-develop',
    source: 'hotfix',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  {
    id: 'e4-develop',
    source: 'docs',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  {
    id: 'e5-develop',
    source: 'master',
    target: 'develop',
    type: 'smoothstep',
    style: { stroke: '#bbb', strokeWidth: 2, strokeDasharray: '5,5' }
  }
]
