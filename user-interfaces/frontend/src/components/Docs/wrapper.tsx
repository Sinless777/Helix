"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import DocsSidebar from "@/components/Docs/sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', bgcolor: 'background.default' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="sticky" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open sidebar"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Docs</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar drawer on mobile, permanent panel on desktop */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            ModalProps={{ keepMounted: true }}
          >
            <Box sx={{ width: 280 }} role="presentation" onClick={toggleDrawer(false)}>
              <DocsSidebar />
            </Box>
          </Drawer>
        ) : (
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              bgcolor: 'rgba(35, 39, 42, 0.1)',
              borderRight: `1px solid ${theme.palette.divider}`,
              overflowY: 'auto',
            }}
          >
            <DocsSidebar />
          </Box>
        )}

        {/* Main Markdown Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 4 },
            overflowY: 'auto',
            bgcolor: 'rgba(35, 39, 42, 0.1)',
            color: 'rgba(0, 0, 0, 0.87)',
            minHeight: '0',
          }}
        >
          {children}
        </Box>

        {/* Optional Ad or Info panel on desktop */}
        {!isMobile && (
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              bgcolor: 'background.default',
              borderLeft: `1px solid ${theme.palette.divider}`,
              p: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Ad / Info
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
