// user-interfaces/frontend/src/components/MermaidChart/index.tsx
'use client'

import mermaid from 'mermaid'
import type { MermaidConfig } from 'mermaid'
import { useEffect, useRef } from 'react'

export interface MermaidChartProps {
  /** The raw Mermaid definition string */
  chart: string
  /** Optional Mermaid initialization/configuration */
  config?: MermaidConfig
}

export function MermaidChart({ chart, config }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize Mermaid with useMaxWidth disabled so we can set our own dimensions
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      theme: 'base',
      flowchart: { useMaxWidth: false },
      ...config,
    })

    if (!containerRef.current) return

    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
    mermaid
      .render(id, chart)
      .then(({ svg }: any) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      })
      .catch((err: any) => {
        console.error('MermaidChart render error:', err)
      })
  }, [chart, config])

  // By applying a CSS transform, we zoom the diagram 1.5× at render time
  return (
    <div
      ref={containerRef}
      style={{
        transform: 'scale(1.5)',
        transformOrigin: '0 0',
      }}
    />
  )
}
