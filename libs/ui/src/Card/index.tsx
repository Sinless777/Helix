import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Image from 'next/image'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

// Define a list item interface with text and link
export interface ListItemProps {
  text: string
  href: string
  target?: string
}

export interface CardProps {
  title: string
  description?: string
  listItems?: ListItemProps[]
  image?: string
  link?: string
  buttonText?: string
  quote?: string
  sx?: React.CSSProperties
}

export const Helix_Card: React.FC<CardProps> = ({
  title,
  description,
  listItems,
  image,
  link,
  buttonText,
  quote,
  sx,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: `0.05rem solid rgb(247,6,141)}`,
        borderRadius: 10,
        padding: 4,
        ...(sx || {}),
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mt: 2,
          textAlign: 'center',
          color: '#daa520',
          fontFamily: '"Italianno", cursive',
          fontSize: '4rem',
        }}
      >
        {title}
      </Typography>

      {image && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Image src={image} alt={title} width={500} height={400} />
        </Box>
      )}

      <br />

      <Box
        sx={{
          maxHeight: 300,
          overflow: 'auto',
          border: '0.05rem solid #daa520',
          borderRadius: 10,
          padding: 2,
        }}
      >
        {quote && (
          <>
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                textAlign: 'center',
                color: '#daa520',
                fontSize: '1.25rem',
                fontFamily: '"Mate SC", serif',
              }}
            >
              {quote}
            </Typography>
            <br />
          </>
        )}

        {listItems && listItems.length > 0 ? (
          <List sx={{ mt: 1, padding: 0, textAlign: 'center' }}>
            {listItems.map((item, idx) => (
              <ListItem
                key={idx}
                sx={{
                  display: 'list-item',
                  padding: 0,
                  justifyContent: 'center',
                }}
              >
                <Button
                  href={item.href}
                  target={item.target || '_blank'}
                  rel="noopener noreferrer"
                  sx={{
                    color: '#daa520',
                    fontSize: '1.25rem',
                    fontFamily: '"Mate SC", serif',
                    textTransform: 'none',
                  }}
                >
                  {item.text}
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          description && (
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                textAlign: 'center',
                color: '#daa520',
                fontSize: '1.25rem',
                fontFamily: '"Mate SC", serif',
              }}
            >
              {description}
            </Typography>
          )
        )}
      </Box>

      {link && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {link.startsWith('/') ? (
            <Link href={link} passHref legacyBehavior>
              <Button component="a" variant="contained" color="primary">
                {buttonText || 'Read more'}
              </Button>
            </Link>
          ) : (
            <Button
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                backgroundColor: '#daa520',
                color: 'black',
                fontSize: '1.25rem',
                fontFamily: '"Mate SC", serif',
                borderRadius: 10,
              }}
            >
              {buttonText}
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Helix_Card
