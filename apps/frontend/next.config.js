//@ts-check
const { composePlugins, withNx } = require('@nx/next');


/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},

  // Use a different distDir for local Nx builds, but let Vercel use the
  // default `.next` when running on Vercel so the platform can find
  // `routes-manifest.json` and other expected artifacts.
  distDir: process.env.VERCEL ? '.next' : '../../dist/apps/frontend',
  compiler: {
    // For other options, see https://nextjs.org/docs/architecture/nextjs-compiler#emotion
    emotion: true,
  },

  transpilePackages: ['@helix-ai/ui', '@helix-ai/config', '@helix-ai/hypertune'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Helix-AI/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Sinless-Games/images/**',
      },
      {
        protocol: 'https',
        hostname: 'optimum-dinosaur-24.clerk.accounts.dev',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [100, 75, 50, 25],
  },

};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
