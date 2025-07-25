// src/app/docs/page.tsx
'use client'

import React from 'react'
import { Container, Box, Stack, Typography } from '@mui/material'

export default function DocsPage() {
  return (
    <Container sx={{ p: 4 }}>
      {/* Page Title */}
      <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
        Welcome to the Helix Documentation
      </Typography>

      {/* Introduction */}
      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="body1" paragraph>
          Helix AI is an innovative, AI‑powered virtual assistant engineered to
          break down silos and redefine the way people interact with technology.
          At its heart, Helix acts as a conversational bridge—linking diverse
          platforms, services, and devices into a unified ecosystem under a
          single, intuitive interface. Through advanced natural language
          understanding, sentiment analysis, and real‑time context awareness,
          Helix delivers personalized recommendations and actionable insights
          that drive better decisions and streamline complex workflows.
        </Typography>
        <Typography variant="body1" paragraph>
          Whether alerting on critical incidents across your cloud
          infrastructure, synthesizing meeting notes from multiple channels, or
          providing instantaneous data visualizations on demand, Helix empowers
          users to stay ahead of the curve. Its modular design supports both
          text and voice interactions—allowing seamless handoffs between typing
          and speech without losing context or momentum.
        </Typography>
        <Typography variant="body1" paragraph>
          Built upon a foundation of continuous learning, Helix ingests
          telemetry, usage patterns, and historical data in real time. By
          maintaining a rich tapestry of user preferences and operational
          metrics, Helix not only responds accurately, but also adapts
          proactively—anticipating needs and offering timely suggestions that
          feel remarkably human.
        </Typography>
      </Box>

      {/* Core Features */}
      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Core Features
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body1" paragraph>
            <strong>Platform Integration:</strong> Helix acts as a central hub,
            connecting to over a dozen services—from chat platforms like Discord
            and Slack to cloud providers, version control systems, and social
            media networks.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Conversational Intelligence:</strong> Leveraging
            state‑of‑the‑art LLMs and sentiment analysis, Helix offers an
            empathetic chat experience.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Web Dashboard & Analytics:</strong> The companion web UI
            offers customizable dashboards, real‑time metrics, and rich
            visualizations.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Accessibility & Inclusivity:</strong> Designed for all
            users, Helix supports screen readers, keyboard navigation,
            adjustable font sizes, and voice commands.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Continuous Improvement & Open Source:</strong> Built in the
            open, Helix evolves through community contributions and rigorous
            research.
          </Typography>
        </Stack>
      </Box>

      {/* Architecture & Technology */}
      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Architecture & Technology
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body1" paragraph>
            Helix AI is powered by a microservice‑based, cloud‑native architecture
            designed for maximum scalability and resilience.
          </Typography>
          <Typography variant="body1" paragraph>
            Services communicate via asynchronous messaging (Kafka, RabbitMQ) and
            HTTP/2 gRPC endpoints.
          </Typography>
          <Typography variant="body1" paragraph>
            Data persistence employs CockroachDB for relational storage, Redis
            for caching, and Elasticsearch for search and analytics.
          </Typography>
          <Typography variant="body1" paragraph>
            CI/CD pipelines powered by GitHub Actions and Argo CD, together with
            an Istio service mesh and OpenTelemetry tracing, ensure robust
            deployment and observability.
          </Typography>
          <Typography variant="body1" paragraph>
            Security is enforced through mutual TLS, JWT authorization,
            AES‑256 encryption, and Vault‑managed secrets.
          </Typography>
        </Stack>
      </Box>

      {/* Vision & Philosophy */}
      <Box component="section">
        <Typography variant="h5" gutterBottom>
          Vision & Philosophy
        </Typography>
        <Typography variant="body1" paragraph>
          Helix AI’s mission is user‑centric: to empower individuals and teams
          by providing an AI companion that listens, learns, and grows
          alongside them.
        </Typography>
        <Typography variant="body1" paragraph>
          Beyond reactive responses, Helix proactively anticipates user needs by
          analyzing usage patterns and environmental signals.
        </Typography>
        <Typography variant="body1" paragraph>
          Our vision extends to making AI an integral part of everyday life,
          where virtual companions augment human potential.
        </Typography>
      </Box>
    </Container>
  )
}
