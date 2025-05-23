/**
 * @file ESLint flat config for the frontend package
 *
 * - 🔧 Allows `any` type and unused vars (we trust Prettier for formatting)
 * - 🚫 Enforces Prettier errors as ESLint errors
 * - 📑 Pulls in Next.js, TypeScript, React & Prettier shareable configs
 * - 📋 Registers and enforces `eslint-plugin-editorconfig`
 * - 🛑 Ignores build output, coverage and node_modules
 */

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import reactPlugin from 'eslint-plugin-react'
import prettierPlugin from 'eslint-plugin-prettier'
import editorconfigPlugin from 'eslint-plugin-editorconfig'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  // 1) ignore build output & deps
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.next/**'] },

  // 2) register plugins
  {
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
      editorconfig: editorconfigPlugin,
    },
  },

  // 3) pull in shareable configs
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    // use the “all” preset to enforce EditorConfig rules
    'plugin:editorconfig/all',
  ),

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
      // let Prettier & EditorConfig handle formatting
      indent: 'off',
      'linebreak-style': 'off',

      // relax TypeScript/React strictness
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/react-in-jsx-scope': 'off',

      // ensure Prettier errors surface as ESLint errors
      'prettier/prettier': ['error'],

      // enforce EditorConfig charsets & indent styles
      'editorconfig/charset': 'off',
      'editorconfig/indent': ['error'],
      'editorconfig/line-ending-style': 'off',
    },
  },
]
