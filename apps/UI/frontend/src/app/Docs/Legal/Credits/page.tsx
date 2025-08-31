'use client'

import * as React from 'react'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  useTheme
} from '@mui/material'
import Grid from '@mui/material/Grid' // MUI v6 Grid (new API with `size`)
import {
  AccreditationCards,
  type AccreditationCard,
  type Org,
  type Person,
  type Backer,
  type Link as LinkType
} from './credits'

// helpers
const money = (n?: number) =>
  typeof n === 'number' ? `$${n.toLocaleString()}` : undefined

type OrgLogoProps = { org: Org; size?: number } // circle diameter (px)

export function OrgLogo({ org, size = 96 }: OrgLogoProps) {
  if (!org.logo) return null
  const theme = useTheme()
  const id = React.useId() // ensure unique <path> ids per instance

  const src = org.logo as string | StaticImageData
  const alt = org.alt ?? org.name

  // geometry
  const r = size / 2
  const gap = Math.max(10, Math.round(size * 0.18)) // distance from circle to arc
  const R = r + gap // arc radius
  const svgW = size + 16
  const svgH = r + gap + 26 // enough room for arc + circle

  // font sizing tuned to arc length
  const fontSize = Math.max(10, Math.round(size * 0.18))

  return (
    <Box
      component={org.url ? Link : 'div'}
      href={org.url ?? '#'}
      target={org.url ? '_blank' : undefined}
      rel={org.url ? 'noopener noreferrer' : undefined}
      aria-label={org.url ? `${org.name} (opens in new tab)` : org.name}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        p: 1,
        borderRadius: 2,
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover, &:focus-visible': {
          transform: 'translateY(-2px)',
          boxShadow: 6
        },
        outline: 'none'
      }}
    >
      {/* CIRCULAR LOGO */}
      <Box
        className="orgRing"
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.paper',
          boxShadow:
            theme.palette.mode === 'dark'
              ? 'inset 0 0 0 1px rgba(255,255,255,0.08)'
              : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
          position: 'relative',
          transition: 'box-shadow .2s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: `0 0 0 2px ${theme.palette.divider} inset`,
            pointerEvents: 'none'
          },
          '&:hover, :focus-visible': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main} inset`
          }
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </Box>

      {/* Hover color cue for the arc label */}
      <style jsx>{`
        :global(a:hover .orgArcText),
        :global(a:focus-visible .orgArcText),
        :global(div:hover .orgArcText),
        :global(div:focus-visible .orgArcText) {
          fill: ${theme.palette.primary.main};
        }
      `}</style>
    </Box>
  )
}

function PeopleList({ people }: { people?: Person[] }) {
  if (!people?.length) return null
  return (
    <Stack spacing={0.5}>
      {people.map((p, i) => (
        <Typography key={`${p.name}-${i}`} variant="body2">
          <strong>{p.name}</strong>
          {p.role ? ` — ${p.role}` : ''}
          {p.handle ? ` (${p.handle})` : ''}
          {p.url ? (
            <>
              {' '}
              ·{' '}
              <Link href={p.url} target="_blank" rel="noopener noreferrer">
                {new URL(p.url).hostname.replace('www.', '')}
              </Link>
            </>
          ) : null}
        </Typography>
      ))}
    </Stack>
  )
}

function LinksList({ links }: { links?: LinkType[] }) {
  if (!links?.length) return null
  return (
    <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
      {links.map((l, i) => (
        <Chip
          key={`${l.label}-${i}`}
          component={Link}
          href={l.url}
          clickable
          label={l.label}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          variant="outlined"
        />
      ))}
    </Stack>
  )
}

function Platforms({ platforms }: { platforms?: Org[] }) {
  if (!platforms?.length) return null
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {platforms.map((org, i) => (
        <OrgLogo org={org} key={`${org.name}-${i}`} />
      ))}
    </Stack>
  )
}

function Backers({ backers }: { backers?: Backer[] }) {
  if (!backers?.length) return null
  return (
    <Stack spacing={0.75} mt={1}>
      {backers.map((b, i) => (
        <Stack
          key={`${b.name}-${i}`}
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flexWrap: 'wrap' }}
        >
          <Typography variant="body2" fontWeight={600}>
            {b.name}
          </Typography>
          {b.tier && <Chip label={b.tier} size="small" />}
          {typeof b.amount === 'number' && (
            <Typography variant="caption" color="text.secondary">
              {money(b.amount)}
            </Typography>
          )}
          {b.handle && (
            <Typography variant="caption" color="text.secondary">
              {b.handle}
            </Typography>
          )}
          {b.url && (
            <Typography variant="caption">
              ·{' '}
              <Link href={b.url} target="_blank" rel="noopener noreferrer">
                {new URL(b.url).hostname.replace('www.', '')}
              </Link>
            </Typography>
          )}
          {b.note && (
            <Typography variant="caption" color="text.secondary">
              — {b.note}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  )
}

function CardBody({ title, card }: { title: string; card: AccreditationCard }) {
  const isCrowd = title.toLowerCase().includes('crowdfunding')

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {card.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {card.description}
        </Typography>
      )}

      {/* Orgs / Logos */}
      {card.orgs?.length ? (
        <Box mt={1.5}>
          <Platforms platforms={card.orgs} />
        </Box>
      ) : null}

      {/* People */}
      <Box mt={card.orgs?.length ? 2 : 1}>
        <PeopleList people={card.people} />
      </Box>

      {/* Crowdfunding extras */}
      {isCrowd && (card.platforms?.length || card.backers?.length) ? (
        <Box mt={2}>
          {card.platforms?.length ? (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Platforms
              </Typography>
              <Platforms platforms={card.platforms} />
            </>
          ) : null}
          {card.backers?.length ? (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" gutterBottom>
                Backers
              </Typography>
              <Backers backers={card.backers} />
            </>
          ) : null}
        </Box>
      ) : null}

      {/* Links */}
      <LinksList links={card.links} />

      {/* Tags */}
      {card.tags?.length ? (
        <Stack direction="row" gap={0.75} flexWrap="wrap" mt={1.5}>
          {card.tags.map((t, i) => (
            <Chip key={`${t}-${i}`} label={t} size="small" />
          ))}
        </Stack>
      ) : null}
    </>
  )
}

export default function CreditsPage() {
  const entries = React.useMemo(() => Object.entries(AccreditationCards), [])

  return (
    <Box component="main" sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
      <Typography variant="h2" gutterBottom sx={{ textAlign: 'center' }}>
        Credits & Acknowledgments
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 5, textAlign: 'center' }}>
        With deep gratitude, we thank the individuals, communities, and
        organizations whose creativity, effort, and generosity make Helix
        possible. From the open-source maintainers who provide the tools we
        build upon, to the researchers advancing the science of AI, to the
        communities offering feedback and support, Helix stands on the shoulders
        of a global network of contributors. This project is not the work of one
        team alone—it is the outcome of shared knowledge, collaboration, and
        collective passion for building technology that empowers and protects
        human life.
      </Typography>

      <Grid container spacing={2}>
        {entries.map(([title, card]) => (
          <Grid key={title} size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <CardBody title={title} card={card} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mt: 4, mb: 3 }} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        Want to suggest an edit or add a name? Open a PR or reach us on Discord.
      </Typography>
    </Box>
  )
}
