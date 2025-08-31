// apps/UI/frontend/next.config.js
//@ts-check
const { composePlugins, withNx } = require('@nx/next')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  trailingSlash: true,

  // Nx-specific options
  nx: {},

  // Next.js Image settings
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
      }
    ],
  },

  // Allowed dev origins
  allowedDevOrigins: ['10.13.13.2', '192.168.10.10', '0.0.0.0/0', '127.0.0.1'],

  webpack(config, { isServer, nextRuntime }) {
     if (!isServer && nextRuntime !== 'edge') {
      config.resolve.fallback = { fs: false, path: false, os: false, crypto: false };
    }

    // 1️⃣ Exclude SVGs from Next.js default file loader
    const assetRule = config.module.rules.find(
      (/** @type {{ test: { toString: () => string | string[]; }; }} */ rule) =>
        rule.test &&
        rule.test.toString().includes('png|jpg|jpeg|gif|webp|avif|ico|bmp|svg')
    )
    if (assetRule) {
      assetRule.exclude = /\.svg$/
    }

    // 2️⃣ Add SVGR loader for SVG imports
    config.module.rules.push({
      test: /\.svg$/i, // match .svg files
      issuer: {
        and: [/\\.(js|ts)x?$/],
      },
      use: [
        {
          loader: require.resolve('@svgr/webpack'),
          options: {
            // svgr options if needed
            icon: true,
          },
        },
      ],
    })

    return config
  },
}

const plugins = [withNx]
module.exports = composePlugins(...plugins)(nextConfig)
