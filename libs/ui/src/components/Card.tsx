'use client';

import * as React from 'react';
import { Box, Button, List, ListItem, Stack, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';

export interface ListItemProps {
  text: string;
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  role: string;
  detailedDescription: string;
  icon?: string;
  image?: string;
}

export interface CardProps {
  title: string;
  description?: string;
  listItems?: ListItemProps[];
  image?: string;
  link?: string;
  buttonText?: string;
  quote?: string;
  aspectRatio?: string;
  sx?: SxProps<Theme>;
}

/**
 * HelixCard — a reusable, theme-aware info card with optional list, image, and quote.
 */
export const HelixCard: React.FC<CardProps> = ({
  title,
  description,
  listItems,
  image,
  link,
  buttonText = `Read more about ${title}`,
  quote,
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        p: 3,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : '0 8px 24px rgba(17,25,40,0.15)',
        transition: 'all 0.25s ease-in-out',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        '&:hover': {
          boxShadow: isDark
            ? '0 12px 32px rgba(0,0,0,0.6)'
            : '0 12px 32px rgba(17,25,40,0.25)',
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        component="h2"
        align="center"
        sx={{
          color: theme.palette.secondary.main,
          fontFamily: '"Mate SC", serif',
          mb: 2,
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      {/* Image */}
      {image && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            mb: 2,
            borderRadius: theme.shape.borderRadius,
            overflow: 'hidden',
          }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{
              objectFit: 'cover',
              borderRadius: theme.shape.borderRadius,
              transition: 'transform 0.3s ease',
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Stack
        spacing={2}
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          mb: 2,
          textAlign: 'center',
        }}
      >
        {quote && (
          <Typography
            variant="body1"
            color="secondary.main"
            fontStyle="italic"
            fontFamily='"Mate SC", serif'
          >
            “{quote}”
          </Typography>
        )}

        {listItems?.length ? (
          <Box sx={{ maxHeight: '10.5rem', overflowY: 'auto' }}>
            <List disablePadding sx={{ textAlign: 'center' }}>
              {listItems.map((item, idx) => (
                <ListItem key={idx} sx={{ display: 'list-item', justifyContent: 'center', p: 0 }}>
                  <Button
                    component="a"
                    href={item.href}
                    target={item.target || '_blank'}
                    rel="noopener noreferrer"
                    variant="text"
                    sx={{
                      color: theme.palette.secondary.main,
                      fontFamily: '"Mate SC", serif',
                      textTransform: 'none',
                      '&:hover': { textDecoration: 'underline' },
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
            color="secondary.main"
            fontFamily='"Mate SC", serif'
            sx={{ overflowY: 'auto', minHeight: '10.5rem' }}
          >
            {description}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            More details coming soon.
          </Typography>
        )}
      </Stack>

      {/* Action Button */}
      {link && (
        <Box textAlign="center" mt="auto">
          {link.startsWith('/') ? (
            <Button
              component={NextLink}
              href={link}
              variant="contained"
              color="primary"
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                fontFamily: '"Mate SC", serif',
                textTransform: 'none',
              }}
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
                px: 3,
                py: 1,
                borderRadius: 2,
                bgcolor: 'secondary.main',
                color: theme.palette.getContrastText(theme.palette.secondary.main),
                fontFamily: '"Mate SC", serif',
                textTransform: 'none',
              }}
            >
              {buttonText}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default HelixCard;
