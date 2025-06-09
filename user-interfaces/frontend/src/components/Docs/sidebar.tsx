'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material'
import { navSections } from '../../constants/Docs/navigation'

export default function DocsSidebar() {
    const pathname = usePathname()

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 250,
                height: '100vh',
                p: 2,
                backgroundColor: '#f5f5f5',
                overflowY: 'auto',
                borderRight: '1px solid #ddd',
                zIndex: 1000,
            }}
        >
            {navSections.map((section, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {section.title}
                    </Typography>
                    <List dense disablePadding>
                        {section.items.map((item, j) => {
                            const active = pathname === item.href
                            return (
                                <ListItem
                                    key={j}
                                    sx={{
                                        pl: 2,
                                        backgroundColor: active ? 'primary.main' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: active ? 'primary.dark' : '#e0e0e0',
                                        },
                                    }}
                                >
                                    <Link
                                        href={item.href}
                                        style={{ width: '100%', textDecoration: 'none' }}
                                    >
                                        <ListItemText
                                            primary={item.label}
                                        />
                                    </Link>
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>
            ))}
        </Box>
    )
}
