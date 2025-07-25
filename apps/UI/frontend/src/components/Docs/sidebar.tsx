'use client'

import { ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { NavItem, navSections } from '@helixai/core'

export default function DocsSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})

  const handleToggle = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderNavItems = (items: NavItem[], level = 0) => (
    <List component="div" disablePadding>
      {items.map((item) => {
        const isSelected = item.href === pathname
        const paddingLeft = 2 + level * 2
        const hasChildren = !!item.items && item.items.length > 0
        const isOpen = Boolean(openItems[item.id])

        const handleClick = () => {
          if (item.href) {
            router.push(item.href)
          }
        }

        return (
          <Box key={item.id}>
            <ListItemButton
              component={hasChildren ? 'div' : Link}
              {...(!hasChildren && item.href ? { href: item.href } : {})}
              onClick={hasChildren ? handleClick : undefined}
              selected={isSelected}
              disabled={item.disabled}
              rel={item.external ? 'noopener noreferrer' : item.rel}
              sx={{
                pl: paddingLeft,
                borderRadius: 2,
                mb: 0.5,
                alignItems: 'center',
                backgroundColor: isSelected ? '#1F2937' : 'transparent',
                border: isSelected
                  ? '1px solid #00B2FF'
                  : '1px solid transparent',
                '&:hover': {
                  background: 'linear-gradient(to right, #1E1E2F, #1C1C2E)',
                },
                color: '#DDDDDD',
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 32, color: '#66CCFF' }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
              )}

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#FAFAFA',
                }}
              />

              {item.badge != null && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    ml: 1,
                    fontSize: '0.7rem',
                    backgroundColor: '#2C2F4A',
                    color: '#99CCFF',
                  }}
                />
              )}

              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle(item.id)
                  }}
                  sx={{ color: '#AAAAAA' }}
                >
                  {isOpen ? (
                    <ExpandLess fontSize="small" />
                  ) : (
                    <ExpandMore fontSize="small" />
                  )}
                </IconButton>
              )}
            </ListItemButton>

            {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                {renderNavItems(item.items ?? [], level + 1)}
              </Collapse>
            )}
          </Box>
        )
      })}
    </List>
  )

  // Return the sidebar component
  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: '#121827',
        overflowY: 'auto',
        px: 2,
        pt: 2,
        color: '#FAFAFA',
        borderRight: '1px solid #1F2937',
      }}
    >
      <List
        component="nav"
        subheader={
          <ListSubheader
            disableSticky
            sx={{
              fontSize: '1.5rem',
              fontWeight: 800,
              textAlign: 'center',
              color: '#FAFAFA',
              bgcolor: 'transparent',
            }}
          >
            Documentation
          </ListSubheader>
        }
      >
        {navSections.map((section, idx) => (
          <Box key={section.id} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                pl: 1,
                mb: 1,
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#CCCCCC',
              }}
            >
              {section.title}
            </Typography>

            {renderNavItems(section.items)}

            {idx < navSections.length - 1 && (
              <Divider
                sx={{
                  my: 2,
                  borderColor: '#1F2937',
                }}
              />
            )}
          </Box>
        ))}
      </List>
    </Box>
  )
}
