// src/app/Docs/layout.tsx
"use client";

import React from "react";
import DocsLayout from "@/components/Docs/wrapper";

export default function AppDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayout>{children}</DocsLayout>;
}
