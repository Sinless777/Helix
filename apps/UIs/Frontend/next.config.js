//@ts-check
const { composePlugins, withNx } = require('@nx/next');

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
  allowedDevOrigins: ['10.13.13.2', "192.168.10.10"],

  // Enable styled-components SWC transform
  compiler: {
    styledComponents: true,
  },

  /**
   * @param {import('webpack').Configuration} config
   * @param {{ isServer: boolean }} options
   * @returns {import('webpack').Configuration}
   **/
  webpack(config, { isServer }) {
    // ————————————————————————————————————————————
    // 1) Guarantee module.rules exists
    // ————————————————————————————————————————————
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // ————————————————————————————————————————————
    // 2) Remove Next's default SVG rule
    // ————————————————————————————————————————————
    for (const rule of config.module.rules) {
      if (
        rule &&
        typeof rule === 'object' &&
        'test' in rule &&
        rule.test instanceof RegExp &&
        rule.test.test('.svg')
      ) {
        rule.exclude = /\.svg$/;
      }
    }

    // ————————————————————————————————————————————
    // 3) Add @svgr/webpack loader
    // ————————————————————————————————————————————
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(js|ts)x?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            titleProp: true,
            ref: true,
          },
        },
      ],
    });

    // ————————————————————————————————————————————
    // 4) Null‐load RSC standalone entries
    // ————————————————————————————————————————————
    config.module.rules.push({
      test: /\.rsc\.tsx$/,
      use: [{ loader: 'null-loader' }],
    });

    // ————————————————————————————————————————————
    // 5) Guarantee resolve.fallback exists for client‐side
    // ————————————————————————————————————————————
    config.resolve = config.resolve || {};
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
