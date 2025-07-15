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

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Helix-AI/images/**',
      },
    ],
  },

  // Allowed Dev Origin
  allowedDevOrigins: ['10.13.13.2', '192.168.10.10'],

  /**
   * @param {import('webpack').Configuration} config
   * @param {{ isServer: boolean }} options
   * @returns {import('webpack').Configuration}
   **/
  webpack(config, { isServer }) {
    return config
  },
}

const plugins = [withNx]
module.exports = composePlugins(...plugins)(nextConfig)
