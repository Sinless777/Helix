/* eslint-disable import/no-anonymous-default-export */
// user-interfaces/frontend/eslint.config.mjs
/**
 * ESLint flat config for the frontend package
 * – Extends the root monorepo config
 */

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import rootConfig from '../../eslint.config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// point compat at this folder so it resolves plugins/shareables locally
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  // 1) bring in everything from your monorepo root
  ...rootConfig,

  // 2) load Next.js/TS/React/Prettier/EditorConfig _from this package’s_ node_modules
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:editorconfig/all',
  ),

  // 3) frontend-specific ignore patterns
  { ignores: ['dist/**', '.next/**', 'node_modules/**', 'coverage/**'] },

  // 4) per-file overrides
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    rules: {
      // enforce Prettier errors
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/react-in-jsx-scope': 'off', // Next.js handles this
      '@typescript-eslint/no-explicit-any': 'off', // relax TS strictness
    },
  },
]
