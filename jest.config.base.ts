import type { Config } from 'jest'

export const baseConfig: Config = {
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@helix/logger/(.*)$': '<rootDir>/libs/logger/src/$1',
    '^@helix/core/(.*)$': '<rootDir>/libs/core/src/$1',
    '^@helix/database/(.*)$': '<rootDir>/libs/database/src/$1',
    '^@helix/ui/(.*)$': '<rootDir>/libs/ui/src/$1',
    '^@auth/(.*)$': '<rootDir>/apis/auth/src/$1',
    '^@frontend/(.*)$': '<rootDir>/user-interfaces/frontend/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/'],
  resetMocks: true,
  clearMocks: true,
  coverageDirectory: './coverage',
  collectCoverageFrom: ['**/src/**/*.{ts,tsx}', '!**/*.d.ts'],
}

export default baseConfig
