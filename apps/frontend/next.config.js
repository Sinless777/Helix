// next.config.js
// Next 16-compatible, no @nx/next runtime plugin

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Nx’s dist path locally; let Vercel use the default `.next`
  distDir: process.env.VERCEL ? '.next' : '../../dist/apps/frontend',

  // SWC compiler options
  compiler: { emotion: true },

  // Transpile workspace libraries without withNx
  transpilePackages: ['@helix-ai/ui', '@helix-ai/config', '@helix-ai/hypertune'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sinlessgamesllc.com', pathname: '/Helix-AI/images/**' },
      { protocol: 'https', hostname: 'cdn.sinlessgamesllc.com', pathname: '/Sinless-Games/images/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    // `qualities` is not a valid Next.js option; remove if present
    qualities: [25, 50, 75, 100],
  },
};

// Safety: strip any accidental legacy `eslint` key (Next 16 disallows it)
if ('eslint' in nextConfig) delete nextConfig.eslint;

module.exports = nextConfig;
