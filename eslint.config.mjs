// eslint.config.mjs (Base ESLint flat config for entire monorepo)
/**
 * @file ESLint flat config for the Helix monorepo
 *
 * - 🔧 Allows `any` type and unused vars (we trust Prettier for formatting)
 * - 🚫 Enforces Prettier errors as ESLint errors
 * - 📑 Pulls in Next.js, TypeScript, React & Prettier shareable configs
 * - 📋 Registers and enforces `eslint-plugin-editorconfig`
 * - 🔍 Applies to all workspaces/packages in the monorepo
 * - 🛑 Ignores build output, coverage and node_modules
 */

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

// plugins
import reactPlugin from 'eslint-plugin-react'
import prettierPlugin from 'eslint-plugin-prettier'
import editorconfigPlugin from 'eslint-plugin-editorconfig'
import tsPlugin from '@typescript-eslint/eslint-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// expose compat so children can call compat.extends(...)
export const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

// the shared root rules + plugin registrations
const rootConfig = [
  // 1) ignore build output & deps everywhere
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.next/**',
    ],
  },

  // 2) register shared plugins
  {
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
      editorconfig: editorconfigPlugin,
      '@typescript-eslint': tsPlugin,
    },
  },

  // 3) pull in shareable configs
  ...compat.extends(
    // you can add more shareables here if you like
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:editorconfig/all',
  ),

  // 4) global per-file overrides
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
      // let Prettier & EditorConfig handle formatting
      indent: 'off',
      'linebreak-style': 'off',

      // relax TypeScript/React strictness
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-implicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // ensure Prettier errors surface as ESLint errors
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // enforce EditorConfig indent style
      'editorconfig/indent': ['error'],
      // optionally disable charset & linebreak-style checks
      'editorconfig/charset': 'off',
      'editorconfig/linebreak-style': 'off',
    },
  },
]

export default rootConfig
