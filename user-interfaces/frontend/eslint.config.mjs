import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // specify the override rules for .ts .tsx .js and .jsx files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  }
]

export default eslintConfig
