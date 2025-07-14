//@ts-check
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  trailingSlash: true,

  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Helix-AI/images/**',
      },
    ],
  },

  // Enable styled-components SWC transform
  compiler: {
    styledComponents: true,
  },

  // Ignore any .rsc.tsx files to prevent duplicate function identifiers
  webpack(config, { isServer }) {
    // Null‐load RSC standalone entries
    config.module.rules.push({
      test: /\.rsc\.tsx$/,
      use: [{ loader: 'null-loader' }],
    })

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }
    return config
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
