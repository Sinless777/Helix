"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import DocsLayout from "@frontend/components/Docs";
import { getDoc } from "@frontend/lib"; // Adjust the import path as needed
import { use } from "react"; // RSC compatibility

export default function DocsPage() {
  const path = usePathname(); // e.g. /Docs/mdx/App-Overviews/Grafana
  const slug = useMemo(
    () => path.replace("/Docs", "").split("/").filter(Boolean),
    [path],
  );

  const mdx: Awaited<ReturnType<typeof getDoc>> = use(getDoc(slug));

  return <DocsLayout>{mdx ? mdx.content : <p>Not found</p>}</DocsLayout>;
}
