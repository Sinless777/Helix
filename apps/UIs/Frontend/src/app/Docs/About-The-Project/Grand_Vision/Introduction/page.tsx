'use client'

import {
  InnovationCriteria,
  KeyValuePillars,
  Phase,
  RoadMap,
} from '@helixai/core'
import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

export default function IntroductionPage() {

  return (
    <Box
      sx={{
        p: { xs: 3, md: 6 },
        maxWidth: '960px',
        mx: 'auto',
        color: '#FAFAFA',
        lineHeight: 1.75,
      }}
    >
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Grand Vision: <span style={{ color: '#66CCFF' }}>Introduction</span>
      </Typography>

      <Typography variant="body1" paragraph sx={{ color: '#CCCCCC', mb: 4 }}>
        Helix AI aims to revolutionize human-computer collaboration by
        seamlessly blending state-of-the-art machine learning models with
        user-centric design. We envision a future where AI systems not only
        understand context and intent but also adapt in real-time to individual
        workflows and team dynamics. By harnessing modular architectures,
        open-source contributions, and transparent processes, Helix AI empowers
        developers, data scientists, and end‑users alike to co-create
        intelligent solutions that are trustworthy, customizable, and ethically
        grounded.
      </Typography>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#66CCFF', fontWeight: 600 }}
      >
        Why Helix AI?
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: '#CCCCCC' }}>
        Imagine having a trusted partner that never stops learning—one that
        supercharges your own expertise instead of sidelining it. That’s Helix
        AI. Whether you’re a busy professional, a government strategist, or a
        military commander, Helix AI adapts to how you work, offering
        crystal-clear insights into every recommendation and safeguarding your
        sensitive data with iron-clad privacy and fairness controls.
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: '#CCCCCC' }}>
        No jargon. No hidden agendas. Just intelligent tools that watch what you
        do, learn from it, and help you make faster, smarter decisions—every
        time. From powering citizen services to optimizing defense operations,
        Helix AI is built on human-centered design, ensuring it’s as trustworthy
        as the people who use it. Ready to elevate your mission? Embrace Helix
        AI today—because the future belongs to teams that combine human
        brilliance with machine precision.
      </Typography>

      <Divider sx={{ my: 5, borderColor: '#333' }} />

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#66CCFF', fontWeight: 600 }}
      >
        Key Value Pillars
      </Typography>

      {KeyValuePillars.map((pillar, i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            {pillar.title}
          </Typography>
          <Typography variant="body1">{pillar.description}</Typography>
        </Box>
      ))}

      <Divider sx={{ my: 5, borderColor: '#333' }} />

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        Roadmap Phases
      </Typography>
      <Typography variant="body1" paragraph>
        Our roadmap is divided into six progressive phases:
      </Typography>

      {RoadMap.map((phase: Phase, i: number) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            Phase {phase.phase}: {phase.title}
          </Typography>
          <Typography variant="body1">{phase.description}</Typography>
        </Box>
      ))}

      <Divider sx={{ my: 5, borderColor: '#333' }} />

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        Innovation Criteria
      </Typography>
      <Typography variant="body1" paragraph>
        To ensure alignment with our vision, every feature is evaluated against
        the following 20 criteria:
      </Typography>

      <Box component="ol" sx={{ pl: 3 }}>
        {InnovationCriteria.map((text, idx) => (
          <li key={idx}>
            <Typography variant="body1" paragraph>
              {text}
            </Typography>
          </li>
        ))}
      </Box>
    </Box>
  )
}
