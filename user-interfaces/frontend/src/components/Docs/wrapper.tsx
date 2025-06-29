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
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import DocsSidebar from "./sidebar";
import { Header } from "@frontend/components";
import { headerProps } from "@frontend/constants/header";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      {/* Header */}
      <Header {...headerProps} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100%",
          pt: 12,
        }}
      >
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

        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            flexDirection: "row",
          }}
        >
          {/* Sidebar drawer on mobile, permanent panel on desktop */}
          {isMobile ? (
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              ModalProps={{ keepMounted: true }}
            >
              <Box
                sx={{ width: 280 }}
                role="presentation"
                onClick={toggleDrawer(false)}
              >
                <DocsSidebar />
              </Box>
            </Drawer>
          ) : (
            <Box
              sx={{
                flex: "0 0 clamp(200px, 20%, 300px)",
                flexShrink: 0,
                bgcolor: "rgba(35, 39, 42, 0.1)",
                overflowY: "auto",
              }}
            >
              <DocsSidebar />
            </Box>
          )}

          {/* Main Markdown Content */}
          <Box
            sx={{
              overflowY: "auto",
              p: 2,
              bgcolor: "rgba(16, 17, 18, 0.5)",
              color: "rgba(255, 255, 255, 0.87)",
              flex: "1 1 auto",
            }}
          >
            {children}
          </Box>

          {/* Optional Ad or Info panel on desktop */}
          {!isMobile && (
            <Box
              sx={{
                // Dynamic width based on screen size
                flex: "0 0 clamp(150px, 15%, 260px)",
                flexShrink: 0,
                bgcolor: "background.default",
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: { xs: "none", sm: "block" },
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Ad / Info
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
