// src/app/Docs/[...slug]/page.tsx
"use client";
import DocsLayout from "@frontend/components/Docs";
import { ThemeProvider } from "@mui/material/styles";
import { themes } from "@frontend/constants";

export default async function DocsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={themes.DocsTheme}>
      <DocsLayout>{children}</DocsLayout>
    </ThemeProvider>
  );
}
