'use client'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

interface Milestone {
  title: string
  description: string
  state: 'open' | 'closed'
  due_on: string | null
  html_url: string
  number: number
  open_issues: number
  closed_issues: number
}

export default function Page() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await fetch(
          'https://api.github.com/repos/Sinless777/Helix/milestones?state=all',
        )
        const data = await res.json()
        setMilestones(data)
      } catch (err) {
        console.error('Failed to fetch milestones', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [])

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: '#FAFAFA',
          fontWeight: 700,
          textAlign: 'center',
          fontSize: '2rem',
          mb: 4,
        }}
      >
        🧭 Helix Project Milestones
      </Typography>

      {loading ? (
        <CircularProgress color="secondary" />
      ) : (
        <Stack spacing={3}>
          {milestones.map((milestone) => {
            const totalIssues = milestone.open_issues + milestone.closed_issues
            const progress =
              totalIssues === 0
                ? 0
                : (milestone.closed_issues / totalIssues) * 100

            return (
              <Card
                key={milestone.number}
                sx={{
                  backgroundColor: '#121827',
                  color: '#FAFAFA',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {milestone.state === 'open' ? (
                      <RocketLaunchIcon sx={{ color: '#66CCFF' }} />
                    ) : (
                      <CheckCircleOutlineIcon sx={{ color: '#33FF99' }} />
                    )}
                    <Typography
                      variant="h6"
                      component="a"
                      href={milestone.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: '#66CCFF',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {milestone.title}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#CCCCCC',
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {milestone.description || 'No description provided.'}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mb: 2,
                      backgroundColor: '#1f2937',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00B2FF',
                      },
                    }}
                  />

                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={milestone.state.toUpperCase()}
                      color={milestone.state === 'open' ? 'primary' : 'success'}
                      size="small"
                      sx={{ color: 'white' }}
                    />
                    {milestone.due_on && (
                      <Chip
                        label={`Due: ${new Date(milestone.due_on).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                        sx={{ color: '#DDDDDD', borderColor: '#555' }}
                      />
                    )}
                    <Chip
                      label={`${milestone.closed_issues}/${totalIssues} issues closed`}
                      size="small"
                      variant="outlined"
                      sx={{ color: '#AAAAAA', borderColor: '#444' }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
