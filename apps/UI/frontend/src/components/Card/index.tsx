'use client'

import {
  Box,
  Button,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import Image from 'next/image'
import NextLink from 'next/link'
import React from 'react'

export interface ListItemProps {
  text: string
  href: string
  target?: React.HTMLAttributeAnchorTarget
  role: string
  detailedDescription: string
  icon?: string
  image?: string
}

export interface CardProps {
  title: string
  description: string
  listItems?: ListItemProps[]
  image: string
  link: string
  buttonText?: string
  quote?: string
  aspectRatio?: string
  sx?: object
}

export const HelixCard: React.FC<CardProps> = ({
  title,
  description,
  listItems,
  image,
  link,
  buttonText = `Read more About ${title}`,
  quote,
  aspectRatio = '56.25%',
  sx,
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        bgcolor: 'rgba(0,0,0,0.4)',
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: theme.shape.borderRadius,
        p: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        component="h2"
        align="center"
        color="secondary.main"
        fontFamily='"Mate SC", serif'
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>
      {/* Image */}
      {image && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 200,
            mb: 2,
            borderRadius: theme.shape.borderRadius,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            src={image}
            alt={title}
            fill
            style={{ objectFit: 'contain', padding: '1rem' }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Box>
      )}

      {/* Scrollable content */}
      <Stack
        spacing={2}
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.secondary.main}`,
          borderRadius: theme.shape.borderRadius,
          p: 2,
          mb: 2,
        }}
      >
        {quote && (
          <Typography
            variant="body1"
            align="center"
            color="secondary.main"
            fontStyle="italic"
            fontFamily='"Mate SC", serif'
          >
            “{quote}”
          </Typography>
        )}

        {listItems && listItems.length > 0 ? (
          <Box sx={{ maxHeight: '10.5rem', overflowY: 'auto' }}>
            <List disablePadding sx={{ textAlign: 'center' }}>
              {listItems.map((item, idx) => (
                <ListItem
                  key={idx}
                  sx={{ display: 'list-item', justifyContent: 'center', p: 0 }}
                >
                  <Button
                    component="a"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    sx={{
                      color: 'secondary.main',
                      fontFamily: '"Mate SC", serif',
                      textTransform: 'none',
                    }}
                  >
                    {item.text}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : description ? (
          <Typography
            variant="body2"
            align="center"
            color="secondary.main"
            fontFamily='"Mate SC", serif'
            sx={{ overflowY: 'auto', maxHeight: '10.5rem' }}
          >
            {description}
          </Typography>
        ) : (
          <Typography variant="body2" align="center" color="text.secondary">
            More details coming soon.
          </Typography>
        )}
      </Stack>

      {/* Link/Button */}
      {link && (
        <Box textAlign="center">
          {link.startsWith('/') ? (
            <Button
              component={NextLink}
              href={link}
              passHref
              variant="contained"
              color="primary"
              aria-label={`Learn more about ${title}`}
            >
              {buttonText}
            </Button>
          ) : (
            <Button
              component="a"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                bgcolor: 'secondary.main',
                color: theme.palette.getContrastText(
                  theme.palette.secondary.main
                ),
                fontFamily: '"Mate SC", serif',
              }}
              aria-label={`Learn more about ${title}`}
            >
              {buttonText}
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}

export default HelixCard
