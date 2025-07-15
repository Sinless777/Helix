// src/app/Docs/page.tsx
'use client'

import { Box, Typography } from '@mui/material'

export default function DocsHome() {
  return (
    <Box sx={{ pl: 6, pr: 6, pt: 2, pb: 4 }}>
      {/* Page Title */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          justifyContent: 'center',
          display: 'flex',
          textAlign: 'center',
          pb: 5,
        }}
      >
        Welcome to the Helix Documentation
      </Typography>
      <Box>
        {/* Introduction */}
        <Typography variant="body1" gutterBottom sx={{ pb: 2 }}>
          Helix AI is an innovative, AI-powered virtual assistant engineered to
          break down silos and redefine the way people interact with technology.
          At its heart, Helix acts as a conversational bridge—linking diverse
          platforms, services, and devices into a unified ecosystem under a
          single, intuitive interface. Through advanced natural language
          understanding, sentiment analysis, and real-time context awareness,
          Helix delivers personalized recommendations and actionable insights
          that drive better decisions and streamline complex workflows.
          <br />
          <br />
          Whether alerting on critical incidents across your cloud
          infrastructure, synthesizing meeting notes from multiple channels, or
          providing instantaneous data visualizations on demand, Helix empowers
          users to stay ahead of the curve. Its modular design supports both
          text and voice interactions—allowing seamless handoffs between typing
          and speech without losing context or momentum.
          <br />
          <br />
          Built upon a foundation of continuous learning, Helix ingests
          telemetry, usage patterns, and historical data in real time. By
          maintaining a rich tapestry of user preferences and operational
          metrics, Helix not only responds accurately, but also adapts
          proactively—anticipating needs and offering timely suggestions that
          feel remarkably human.
          <br />
          <br />
          Designed with enterprise-grade security and privacy in mind, Helix
          implements customizable access controls, end-to-end encryption, and
          compliance with industry standards. Whether you&apos;re a developer,
          system administrator, or business executive, Helix provides the tools
          and insights you need to collaborate, innovate, and excel in
          today&apos;s fast-paced digital landscape.
        </Typography>
        {/* Core Features Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
          Core Features
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Helix AI is designed to be a comprehensive, user-friendly platform
          that enhances productivity and collaboration across various domains.
          Here are some of its key features:
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ pb: 2 }}>
          <br />
          <br />
          <strong>Platform Integration:</strong> Helix acts as a central hub,
          connecting to over a dozen services—from chat platforms like Discord
          and Slack to cloud providers, version control systems, and social
          media networks. With unified authentication and a consistent
          interface, you can perform cross-platform workflows without context
          switching, saving time and reducing errors.
          <br />
          <br />
          <strong>Conversational Intelligence:</strong> Leveraging
          state-of-the-art LLMs and sentiment analysis, Helix offers an
          empathetic chat experience. It understands nuance and intent,
          providing real-time, step-by-step guidance for technical tasks,
          troubleshooting, or everyday conversational support. Over time, it
          learns personal preferences to make interactions both efficient and
          engaging.
          <br />
          <br />
          <strong>Web Dashboard & Analytics:</strong> The companion web UI
          offers customizable dashboards, real-time metrics, and rich
          visualizations. Track system health, user engagement, and AI
          performance all in one place. Drill down into logs, alerts, and
          insights with interactive charts, enabling data-driven decisions and
          rapid iteration.
          <br />
          <br />
          <strong>Accessibility & Inclusivity:</strong> Designed for all users,
          Helix supports screen readers, keyboard navigation, adjustable font
          sizes, and voice commands. Integration with popular assistive
          technologies ensures that individuals with diverse abilities can
          harness Helix&apos;s full potential.
          <br />
          <br />
          <strong>Continuous Improvement & Open Source:</strong> Built in the
          open, Helix evolves through community contributions and rigorous
          research. Its modular architecture and plugin system allow you to
          extend functionality, integrate custom models, and share enhancements
          back to the ecosystem, ensuring sustainable growth and innovation.
        </Typography>
        {/* Architecture & Technology Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
          Architecture & Technology
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ pb: 2 }}>
          Helix AI is powered by a microservice-based, cloud-native architecture
          designed for maximum scalability and resilience. Each service—ranging
          from user authentication and session management to telemetry ingestion
          and natural language processing—runs in its own container orchestrated
          by Kubernetes, ensuring fault isolation and seamless updates.
          <br />
          <br />
          Services communicate via asynchronous messaging (using Kafka and
          RabbitMQ) and HTTP/2 gRPC endpoints, enabling low-latency, highly
          reliable data exchange. The core AI engine leverages both
          custom-trained LLMs and public models through the Hugging Face Hub,
          served via a high-performance inference gateway that optimizes for
          throughput and minimal response times.
          <br />
          <br />
          Data persistence employs a polyglot storage strategy: CockroachDB for
          distributed, resilient relational data and user profiles, Redis for
          caching session state and pub/sub patterns, and Elasticsearch for
          real-time search and analytics on logs and metrics. Real-time event
          streams are processed by a scalable Spark/Flink pipeline, feeding
          machine learning workflows and dashboards.
          <br />
          <br />
          CI/CD pipelines powered by GitHub Actions and Argo CD automate build,
          test, and deployment processes. A service mesh (Istio) manages traffic
          routing, mutual TLS, and circuit breaking, while OpenTelemetry tracing
          and Prometheus metrics feed Grafana dashboards for comprehensive
          observability. Infrastructure as code via Terraform guarantees
          reproducible environments and streamlined provisioning.
          <br />
          <br />
          Security and compliance are built-in at every layer: mutual TLS,
          JWT-based authorization, end-to-end encryption, and fine-grained RBAC.
          All data at rest is encrypted with AES-256, and secrets are managed
          through Vault. This robust, extensible platform foundation ensures
          that Helix AI can adapt to evolving requirements while maintaining
          high performance and security standards.
        </Typography>
        {/* Vision & Philosophy Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
          Vision & Philosophy
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ pb: 2 }}>
          Helix AI&apos;s mission is deeply user-centric: to empower individuals
          and teams by providing an AI companion that listens, learns, and grows
          alongside them. Grounded in principles of honesty, empathy, and
          continuous improvement, Helix offers guidance that is both
          compassionate and actionable.
          <br />
          <br />
          At the beginning of every interaction, Helix&apos;s conversational
          design acknowledges reality with empathy—validating challenges and
          perspectives before offering solutions. This two-step approach fosters
          trust and ensures recommendations are contextually relevant and
          emotionally resonant.
          <br />
          <br />
          Beyond reactive responses, Helix proactively anticipates user needs by
          analyzing usage patterns and environmental signals. Whether it&apos;s
          reminding you of a looming deadline, suggesting optimizations for your
          workflow, or surfacing relevant documentation at the perfect moment,
          Helix serves as an ever-present ally in your journey toward success.
          <br />
          <br />
          Our vision extends to making AI an integral part of everyday
          life—where virtual companions augment human potential, bridge gaps in
          knowledge, and inspire new ways of thinking. By adhering to
          open-source collaboration and rigorous research, Helix AI stands at
          the forefront of ethical AI development, ensuring technology remains a
          force for good.
          <br />
          <br />
          <em>
            “In a world of complexity, Helix AI is the thread that weaves
            clarity, support, and innovation into the fabric of daily life.”
          </em>
        </Typography>
      </Box>
    </Box>
  )
}
