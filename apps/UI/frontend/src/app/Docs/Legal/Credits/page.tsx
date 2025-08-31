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
  Divider
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

function OrgLogo({ org }: { org: Org }) {
  if (!org.logo) return null
  const src = org.logo as string | StaticImageData
  const alt = org.alt ?? org.name

  return (
    <Box
      component={org.url ? Link : 'div'}
      href={org.url ?? '#'}
      target={org.url ? '_blank' : undefined}
      rel={org.url ? 'noopener noreferrer' : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        width: 140,
        height: 56,
        overflow: 'hidden',
        textDecoration: 'none'
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={128}
        height={40}
        style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
      />
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
