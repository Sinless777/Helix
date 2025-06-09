// src/app/Docs/layout.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import DocsSidebar from "@/components/Docs/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "rgba(28, 28, 28, 0.9)",
      }}
    >
      {/* Sidebar */}
      <DocsSidebar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          overflow: "auto",
          backgroundColor: "rgba(28, 28, 28, 0.1)",
          color: "#fff",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
