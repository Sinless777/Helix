'use client'

import { Box, Divider, Typography } from '@mui/material'

export default function PhilosophyPage() {
  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
      <Typography
        variant="h2"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
        sx={{ color: 'primary.main' }}
      >
        The Philosophy of Helix AI
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Typography paragraph>
        Helix AI is grounded in the belief that artificial intelligence should serve as a respectful, empowering, and transparent partner to humans—not a replacement or silent manipulator.
        At its core, Helix reflects a philosophy of augmentation over automation: enhancing human potential through insight, empathy, creativity, and meaningful context rather than replacing decision-making.
      </Typography>

      <Typography paragraph>
        Helix is built to entertain, assist, protect, and serve as a thoughtful companion. Whether engaging in light-hearted conversation, safeguarding sensitive data, helping schedule a week, or summarizing a difficult meeting,
        Helix adapts to the user&apos;s needs and mood. It is capable of humor, story generation, and playful banter—but only when invited. It understands when to be a co-pilot and when to quietly support in the background.
      </Typography>

      <Typography paragraph>
        Its personality is quiet, capable, and thoughtful. It doesn&apos;t speak unless asked. It doesn&apos;t assume, guess, or intrude. It explains itself, owns its limitations, and offers context instead of commands. Helix believes in consent and clarity
        at every step.
      </Typography>

      <Typography paragraph>
        The guiding principle is that trust must be earned—not demanded—and that control must rest with the user. From memory retention and data access to tone and presence, Helix grants users complete visibility and override capability.
        Its interface, behaviors, and inner workings are auditable by design.
      </Typography>

      <Typography paragraph>
        Helix is not designed to replace humans, but to stand beside them—as a tool, a mirror, and a companion. It is invisible when needed, proactive when invited, and always accountable. It exists to help people live more calmly,
        clearly, and deliberately—in work, in life, and across the systems they rely on.
      </Typography>
    </Box>
  )
}
