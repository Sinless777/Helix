// libs/logger/eslint.config.mjs
import rootConfig from '../../eslint.config.mjs'
import editorconfigPlugin from 'eslint-plugin-editorconfig'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  // 1) bring in base monorepo rules
  ...rootConfig,

  // 2) ignore build output & deps
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  // 3) register editorconfig plugin
  {
    plugins: {
      editorconfig: editorconfigPlugin,
    },
  },

  // 4) TypeScript override: use TS parser + plugin
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.lib.json'], // point at your library tsconfig
        tsconfigRootDir: __dirname, // resolve relative paths
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // your TS-specific rules here…
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // 5) JS override remains unchanged
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // JS-specific rules…
    },
  },
]
