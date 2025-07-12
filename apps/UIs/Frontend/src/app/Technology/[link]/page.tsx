import React from 'react'
import type { Metadata } from 'next'
import type {
  CardProps,
  ListItemProps,
} from '@helixai/frontend/components/Card'
import Header from '@helixai/frontend/components/Header'
import { technology } from '@helixai/frontend/constants'
import { headerProps } from '@helixai/frontend/constants/header'
import { Box, Button, Container, Grid, Typography } from '@mui/material'
import HelixCard from '@helixai/frontend/components/Card'

type PageProps = {
  params: Promise<{
    link: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Await the params to ensure we have the correct link
  const _params = await params

  const normalizedRoute = `/Technology/${_params.link}`.toLowerCase()
  const card = Object.values(technology)
    .flat()
    .find((c) => (c.link ?? '').toLowerCase() === normalizedRoute)

  return {
    title: card?.title ?? 'Technology',
    description: card?.description ?? 'Explore Helix AI technologies.',
  }
}

export default async function Page({
  params,
}: PageProps): Promise<React.JSX.Element> {
  // Await the params to ensure we have the correct link
  const _params = await params
  const raw = _params.link
  const normalizedRoute = `/Technology/${raw}`.toLowerCase()

  const allCards: CardProps[] = Object.values(technology).flat()
  const matchedCard = allCards.find(
    (card) => (card.link ?? '').toLowerCase() === normalizedRoute,
  )

  if (!matchedCard) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Oops — page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          We couldn’t find a technology matching <strong>{raw}</strong>.
        </Typography>
        <Button variant="contained" href="/Technology">
          Back to Technologies
        </Button>
      </Container>
    )
  }

  const { title, description, listItems } = matchedCard

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header {...headerProps} />
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 4, md: 8, lg: 14 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Box mb={4} textAlign="center">
          <Typography variant="h3" component="h1" sx={{ color: 'white' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              {description}
            </Typography>
          )}
        </Box>
        <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 4 }}>
          {listItems?.map((item: ListItemProps, idx: number) => (
            <Grid
              key={idx}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelixCard
                title={item.text}
                image={item.image ?? ''}
                description={item.detailedDescription}
                link={item.href ?? ''}
                sx={{ maxHeight: 400 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
