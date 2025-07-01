import { FlatCompat } from '@eslint/eslintrc';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginCypress from 'eslint-plugin-cypress';

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// @commitlint/config-conventional provides conventional commit rules
export default [
  // Core recommended rules
  compat.extends('eslint:recommended'),
  compat.extends('plugin:@typescript-eslint/recommended'),
  compat.extends('plugin:@typescript-eslint/recommended-requiring-type-checking'),

  // Prettier integration
  pluginPrettier,
  ...compat.extends('plugin:prettier/recommended'),

  // Cypress rules
  pluginCypress.configs.recommended,

  // Parser options
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
