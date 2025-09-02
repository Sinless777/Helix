// apps/UI/frontend/src/app/Docs/Developer-Documentation/Contributing/page.tsx
'use client'

import * as React from 'react'
import { Box, Button, Container, Divider, Typography } from '@mui/material'

// Header + shared props are fine to import from your UI lib
import Header from '../../../../components/Header'
import { headerProps } from '@helixai/core'

// ⬇️ Import the data-only graph from core
import {
  ContributingFlowNodes,
  ContributingFlowEdges,
  type FlowNodeData,
  type FlowEdgeData
} from '@helixai/core'

// ⬇️ Use the modern package
import ReactFlow, {
  Background,
  Controls,
  Position,
  type Node,
  type Edge,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'

function toRFNode(n: FlowNodeData): Node {
  return {
    id: n.id,
    data: { label: n.label },
    position: n.position,
    style: { width: n.width ?? 120, ...(n.style || {}) },
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  }
}

function toRFEdge(e: FlowEdgeData): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type ?? 'smoothstep',
    style: e.style
  }
}

export default function ContributingPage() {
  const nodes = React.useMemo<Node[]>(
    () => ContributingFlowNodes.map(toRFNode),
    []
  )
  const edges = React.useMemo<Edge[]>(
    () => ContributingFlowEdges.map(toRFEdge),
    []
  )

  const commitlintText = `Allowed Types: feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert | merge

Branch Prefixes:
  feature/*
  bugfix/*
  hotfix/*
  docs/*

Conventional Commits enforced via CI with @commitlint/config-conventional.`

  return (
    <Box sx={{ backgroundColor: 'transparent', color: 'white', flexGrow: 1 }}>
      <Header {...headerProps} />

      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 4, md: 8, lg: 14 }, pb: { xs: 6, md: 10 } }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Contributing to Helix
        </Typography>

        <Typography variant="body1" gutterBottom>
          Thank you for your interest in contributing to Helix! Our project is
          driven by community collaboration, high code quality, and clear
          documentation. Whether you&apos;re fixing bugs, introducing new
          features, or improving our docs, your contributions make Helix
          stronger.
        </Typography>

        <Typography variant="body1" gutterBottom>
          Below you&apos;ll find guidelines on our Git Flow branching model,
          commit conventions, pull request workflow, release process, and
          automated tooling. Please review each section carefully. If you have
          any questions, join our Discord or open an issue in GitHub.
        </Typography>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        <Typography variant="h4" component="h2" gutterBottom>
          Git Flow Branching Model
        </Typography>

        <Box component="ul" sx={{ pl: 4, mb: 4, '& li': { mb: 1 } }}>
          <li>
            <strong>develop</strong>: Main integration branch for ongoing work
          </li>
          <li>
            <strong>master</strong>: Stable production branch (releases are
            tagged here)
          </li>
          <li>
            <strong>feature/*</strong>: New features from <em>develop</em>
          </li>
          <li>
            <strong>bugfix/*</strong>: Non-critical fixes from <em>develop</em>
          </li>
          <li>
            <strong>hotfix/*</strong>: Critical fixes from <em>master</em>
          </li>
          <li>
            <strong>docs/*</strong>: Documentation updates from <em>develop</em>
          </li>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: 500,
            backgroundColor: '#1A202C',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            mb: 2
          }}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              panOnDrag={false}
              panOnScroll={false}
              style={{ width: '100%', height: '100%' }}
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>

        <Typography variant="h5" component="h3" gutterBottom>
          Legend & Notes
        </Typography>
        <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 }, mb: 6 }}>
          <li>
            <strong>feature/*</strong>: branch off <code>develop</code>
          </li>
          <li>
            <strong>bugfix/*</strong>: branch off <code>develop</code>
          </li>
          <li>
            <strong>hotfix/*</strong>: branch off <code>master</code>
          </li>
          <li>
            <strong>docs/*</strong>: branch off <code>develop</code>
          </li>
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        <Typography variant="h5" component="h3" gutterBottom>
          Commit Conventions & Prefixes
        </Typography>
        <Typography variant="body1" gutterBottom>
          We enforce Conventional Commits via CI to maintain a clear changelog:
        </Typography>
        <Box
          component="pre"
          sx={{
            background: '#1A202C',
            p: 3,
            borderRadius: 2,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            mb: 6
          }}
        >
          {commitlintText}
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* …(rest of your sections unchanged)… */}

        <Button
          variant="contained"
          href="https://github.com/Sinless777/Helix/blob/master/CONTRIBUTING.md"
          sx={{ mt: 2, mb: 10 }}
        >
          View Full CONTRIBUTING.md
        </Button>
      </Container>
    </Box>
  )
}
