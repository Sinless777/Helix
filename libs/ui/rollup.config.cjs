const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: '../../dist/libs/ui',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: [
      // react
      'react',
      'react-dom',
      'react/jsx-runtime',

      // helix workspaces
      '@helix-ai/hypertune',
      '@helix-ai/config',

      // mui & emotion
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',

      // faro sdk (keep out of bundle!)
      '@grafana/faro-react',
      '@grafana/faro-web-sdk',
      '@grafana/faro-web-tracing'
    ],
    format: ['esm'],
    assets: [{ input: '.', output: '.', glob: 'README.md' }],
    rollupOptions: {
      treeshake: { moduleSideEffects: false }
    }
  },
  {
    plugins: [
      svg({ svgo: false, titleProp: true, ref: true }),
      url({ limit: 10_000 })
    ]
  }
);
