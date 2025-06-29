// next.config.ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

// Shared MDX compiler options
const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [[rehypePrettyCode, { theme: "one-dark-pro" }]],
  providerImportSource: "@mdx-js/react",
};

// `@next/mdx` handles both routing AND importing of .md/.mdx
const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: mdxOptions,
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Origin Policies
   * 
   * This is a security feature that allows you to specify how your application
   * handles cross-origin requests. The "anonymous" value means that the browser
   */
  crossOrigin: "anonymous",
  allowedDevOrigins: [
    "http://localhost:3000", // Local development
    "http://192.168.10.10:3000", // Local development on a specific IP
    "192.168.10.10", // Local development on a specific IP without protocol
  ], // Allow dev origins for local development

  // Build output directory
  // ../../dist/user-interfaces/frontend
  distDir: "../../dist/user-interfaces/frontend",

  // ── Routable file types ──
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sinlessgamesllc.com",
        pathname: "/Helix-AI/images/**",
      },
    ],
  },

  experimental: {
  //   mdxRs: true,            // RSC‑aware MDX compiler (needs @mdx-js/loader installed)
  //   scrollRestoration: true,
  //   typedRoutes: true,
  },

  compiler: {
    styledComponents: true,
  },

  webpack(config) {
    // No extra MDX loaders — `@next/mdx` already wires up @mdx-js/loader internally.
    return config;
  },
};

export default withMDX(nextConfig);
