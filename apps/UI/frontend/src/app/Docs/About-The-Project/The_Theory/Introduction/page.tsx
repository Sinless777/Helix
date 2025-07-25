'use client'

import { Box, Typography, Divider } from '@mui/material'

export default function TheTheoryIntroductionPage() {
  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
      <Typography
        variant="h2"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
        sx={{ color: 'primary.main' }}
      >
        Introduction to the Theory Behind Helix AI
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', pt: 4, pb: 2 }}
      >
        Overview
      </Typography>
      <Typography paragraph>
        Helix AI is designed to be more than just a virtual assistant—it&apos;s
        a unified digital companion that adapts to your needs, whether you're
        working, relaxing, or coordinating everyday life. It simplifies tasks,
        understands natural language, and responds with intelligent,
        context-aware support. Helix doesn&apos;t just react to commands—it
        collaborates with you, acting as a thinking partner that enhances your
        decision-making, reduces friction, and creates flow in your digital
        environment.
      </Typography>
      <Typography paragraph>
        By combining cutting-edge natural language processing, emotional context
        awareness, and adaptive learning, Helix can interpret both what you say
        and how you say it. This allows it to offer meaningful assistance, even
        anticipating your needs based on previous interactions. Its responses
        evolve with you, learning from every conversation and action to better
        align with your style, tone, and intent over time.
      </Typography>
      <Typography paragraph>
        With Helix, you can automate routine actions, receive summaries of
        conversations or meetings, and interact through voice, text, or
        visuals—all while enjoying seamless continuity across sessions and
        devices. It&apos;s designed to bridge gaps across tools and tasks,
        acting as a unifying layer that brings context, memory, and relevance to
        everything you do.
      </Typography>
      <Typography paragraph>
        Security and privacy are fundamental. Helix encrypts all data, gives you
        full control over what it remembers, and includes built-in safeguards to
        ensure reliability and accountability when things go wrong. You can
        inspect, limit, or delete memory at any time, ensuring that trust and
        transparency stay at the core of your relationship with the system.
      </Typography>
      <Typography paragraph>
        In essence, Helix merges intelligence, empathy, and automation to help
        you stay focused, save time, and live a more streamlined digital life.
        Whether you're handling complex workflows or navigating daily tasks,
        Helix is designed to be an intuitive, ever-improving partner in both
        your professional and personal worlds.
      </Typography>
    </Box>
  )
}
