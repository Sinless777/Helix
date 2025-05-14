// next.config.ts
import type { NextConfig } from 'next';
import webpack from 'webpack';
import { composePlugins, withNx } from '@nx/next';
import type { WithNxOptions } from '@nx/next/plugins/with-nx';

const nxOptions: WithNxOptions = {
  // Enable SVGR if you like importing SVGs as React components
  svgr: false,
};

const baseConfig: NextConfig = {
  nx: nxOptions,
  crossOrigin: 'anonymous',
  output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Helix-AI/images/**',
      },
    ],
  },

  webpack(config, { isServer }) {
    // Hot module replacement plugin (Next already does HMR by default in dev)
    config.plugins.push(new webpack.HotModuleReplacementPlugin());

    // NOTE: Next.js doesn't expose `devServer` here—remove this if you see errors.
    // if (!isServer) {
    //   (config.devServer ??= {}).hot = true;
    //   config.devServer.open = true;
    // }

    return config;
  },
};

const plugins = [withNx];

export default composePlugins(...plugins)(baseConfig);
