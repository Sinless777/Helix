const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { composePlugins, withNx } = require('@nx/webpack');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

const OPTIONAL_NATIVE_MODULES = [
  'pg-native',
  'mariadb/callback',
  'better-sqlite3',
  'libsql',
  'tedious',
  'mysql',
  'mysql2',
  'oracledb',
  'pg-query-stream',
  'sqlite3',
];

const OPTIONAL_NATIVE_PATTERN = OPTIONAL_NATIVE_MODULES.map((mod) =>
  mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
).join('|');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    const outputPath = path.resolve(__dirname, '../../../dist/apps/services/user');

    config.entry = {
      main: path.resolve(__dirname, 'src/main.ts'),
    };
    config.output = {
      ...config.output,
      path: outputPath,
      filename: 'main.js',
      clean: true,
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    };

    config.resolve = {
      ...(config.resolve ?? {}),
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
      plugins: [
        ...(config.resolve?.plugins ?? []),
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, '../../../tsconfig.base.json'),
        }),
      ],
    };

    config.devtool = 'source-map';

    config.externalsPresets = {
      ...(config.externalsPresets ?? {}),
      node: true,
    };

    const rootNodeModules = path.resolve(__dirname, '../../../node_modules');
    const serviceNodeModules = path.resolve(__dirname, 'node_modules');
    const existingExternals = Array.isArray(config.externals)
      ? config.externals
      : config.externals
        ? [config.externals]
        : [];

    config.externals = [
      ...existingExternals,
      nodeExternals({
        modulesDir: rootNodeModules,
        additionalModuleDirs: [serviceNodeModules],
      }),
    ];

    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.IgnorePlugin({
        resourceRegExp: new RegExp(`^(${OPTIONAL_NATIVE_PATTERN})$`),
      }),
    ];

    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    return config;
  }
);
