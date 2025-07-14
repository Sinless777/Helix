'use client'

import { RoadMap } from '@helixai/core'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'

const statusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'warning'
    case 'not-started':
      return 'default'
    default:
      return 'default'
  }
}

const RoadmapPage = () => {

  return (
    <Container maxWidth="lg" sx={{ py: 6, color: 'white' }}>
      <Box textAlign="center" mb={5}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{ color: '#FFFFFF' }}
        >
          Helix AI Roadmap
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#DDDDDD',
            maxWidth: 720,
            mx: 'auto',
            fontSize: '1.1rem',
          }}
        >
          This roadmap outlines the phased evolution of Helix AI from initial
          bootstrapping to advanced multi-platform deployment. Each phase
          unlocks new capabilities, security layers, and collaboration tools
          critical to our long-term vision.
        </Typography>
        <Divider
          sx={{
            my: 3,
            borderColor: '#333',
            maxWidth: 300,
            mx: 'auto',
          }}
        />
      </Box>

      <Stack spacing={4}>
        {RoadMap.map((phase) => (
          <Accordion
            key={phase.phase}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#FFFFFF',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: '#FFFFFF' }}
                >
                  Phase {phase.phase}: {phase.title}
                </Typography>
                <Chip
                  label={phase.status}
                  color={statusColor(phase.status)}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    fontWeight: 500,
                    color: '#FFFFFF',
                  }}
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ color: '#DDDDDD' }}
              >
                {phase.description}
              </Typography>
              <Typography
                variant="caption"
                gutterBottom
                sx={{ display: 'block', color: '#AAAAAA' }}
              >
                Timeline: {phase.time_frame}
              </Typography>

              <Box mt={3}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ color: '#88CCFF' }}
                >
                  Tasks
                </Typography>
                <Stack spacing={1}>
                  {phase.tasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        p: 2,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          sx={{ color: '#FFFFFF' }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status}
                          color={statusColor(task.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize', color: '#FFFFFF' }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: '#BBBBBB' }}
                      >
                        {task.description}
                      </Typography>

                      {task.assigned_to && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#888888', display: 'block', mt: 0.5 }}
                        >
                          Assigned to: {task.assigned_to}
                        </Typography>
                      )}
                      {task.due_date && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#888888', display: 'block' }}
                        >
                          Due: {task.due_date}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Container>
  )
}

export default RoadmapPage
