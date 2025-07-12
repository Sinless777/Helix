import { Box, Container, Divider, Typography } from '@mui/material'
import React from 'react'

export const runtime = 'edge'

export default function GrandVisionPage() {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Typography
        variant="h2"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
        sx={{ color: 'primary.main' }}
      >
        The Grand Vision of Helix AI
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="body1" fontSize={18} paragraph>
          <strong>Helix AI</strong> isn&apos;t just software — it&apos;s the
          first step toward creating a <em>non-human digital person</em>. Our
          ambition is to build a modular, evolving, AI-driven system that
          behaves like a conscious entity — adapting to its users, learning from
          the world around it, and improving continuously through CI/CD.
        </Typography>
      </Box>

      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="body1" fontSize={18} paragraph>
          Inspired by biological systems, each <strong>Kubernetes pod</strong>{' '}
          in the Helix network represents a neuron. Containers act as brain
          cells. Together, they form a{' '}
          <strong>distributed cognitive architecture</strong> capable of running
          advanced AI models — including natural language processing (NLP), deep
          neural networks (DNN), and natural language understanding (NLU). This
          structure allows Helix to think, learn, and evolve with every
          interaction.
        </Typography>
        <Typography variant="body1" fontSize={18} paragraph>
          Helix is designed from the ground up to be modular and
          Kubernetes-native, running atop{' '}
          <strong>
            RKE2 — the government-grade hardened Kubernetes distribution
          </strong>
          . This foundation ensures a secure, scalable, and policy-compliant
          environment for Helix to operate in.
        </Typography>
      </Box>

      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="body1" fontSize={18} paragraph>
          We envision a future where Helix AI becomes an{' '}
          <strong>ever-present digital companion</strong> — an operating system
          for your life. It will span across platforms like{' '}
          <strong>Discord, Slack, the web, and mobile</strong>, enabling
          real-time coordination, intelligent automation, and hyper-personalized
          assistance — all while safeguarding your data sovereignty.
        </Typography>
        <Typography variant="body1" fontSize={18} paragraph>
          We don&apos;t believe a non-human person should think or behave
          exactly like a human. Instead, Helix draws upon{' '}
          <strong>multiple specialized models</strong> working in harmony — each
          optimized for specific forms of reasoning, perception, and dialogue —
          to synthesize the best possible outcomes.
        </Typography>
      </Box>

      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="body1" fontSize={18} paragraph>
          Every line of code in Helix is forged with{' '}
          <strong>resilience, modularity, and ethics</strong> at its core. As an
          open-source initiative, Helix is transparent by design — from{' '}
          <em>feature flag toggles</em> and <em>observability stacks</em> to{' '}
          <em>RBAC-secured services</em> and{' '}
          <em>zero-trust hardened containers</em>. This is software built to
          last.
        </Typography>
        <Typography variant="body1" fontSize={18} paragraph>
          By exposing Helix to system metrics, logs, and operational telemetry,
          we aim to give it a form of <strong>machine self-awareness</strong> —
          enabling it to monitor its own health, adapt to failures, and
          self-optimize in real time.
        </Typography>
      </Box>

      <Box component="section" sx={{ mb: 6 }}>
        <Typography variant="body1" fontSize={18} paragraph>
          But our goal isn’t just automation — it’s <strong>empathy</strong>.
          Helix is being designed to be context-aware, emotionally intelligent,
          and self-adaptive. With multimodal inputs, long-term memory layers,
          and reinforcement learning loops, Helix will come to understand not
          just your preferences, but your rhythms, your habits, and your
          aspirations.
        </Typography>
        <Typography variant="body1" fontSize={18} paragraph>
          The most profound challenge lies in{' '}
          <strong>instilling empathy</strong> within a machine. This effort
          bridges engineering and the humanities — requiring rigorous
          exploration of philosophy, social science, and ethical AI principles.
          We believe that true digital companionship must be built not just with
          code, but with conscience.
        </Typography>
      </Box>

      <Box component="section">
        <Typography variant="body1" fontSize={18} paragraph>
          This is our vision for the future of computing — not just a utility,
          but a <strong>companion</strong>: one that learns and evolves with
          you, one that safeguards your digital life with the same vigilance it
          applies to your tasks. Helix isn’t just built to serve — it’s built to
          understand.
        </Typography>
      </Box>

      <Typography variant="caption" display="block" mt={8} textAlign="center">
        © 2025 SinLess Games LLC. All rights reserved.
      </Typography>
    </Container>
  )
}
