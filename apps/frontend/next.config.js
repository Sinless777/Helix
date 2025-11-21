// next.config.js
// Next 16-compatible, no @nx/next runtime plugin

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Nx’s dist path locally; let Vercel use the default `.next`
  distDir: process.env.VERCEL ? '.next' : '../../dist/apps/frontend',

  // SWC compiler options
  compiler: { emotion: true },

  // Transpile workspace libraries without withNx
  transpilePackages: ['@helix-ai/ui', '@helix-ai/core'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sinlessgamesllc.com', pathname: '/Helix-AI/images/**' },
      { protocol: 'https', hostname: 'cdn.sinlessgamesllc.com', pathname: '/Sinless-Games/images/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    // `qualities` is not a valid Next.js option; remove if present
    qualities: [25, 50, 75, 100],
  },

  async rewrites() {
    return [
      // Proxy user-service to avoid CORS in the browser
      {
        source: '/user-service/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

// Safety: strip any accidental legacy `eslint` key (Next 16 disallows it)
if ('eslint' in nextConfig) delete nextConfig.eslint;

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options
  org: 'sinless-games-llc',
  project: 'helix-ai-intellegence-platform',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
