// libs/logger/jest.config.ts

import '@testing-library/jest-dom'
import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  // Identify this project in multi-project runs
  displayName: 'logger',

  // Ensure Jest runs from the logger pkg root
  rootDir: __dirname,

  // Use ts-jest to compile TypeScript, pointing at your spec tsconfig
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  globals: {
    // ⬇︎ tell ts-jest to load your tsconfig.spec.json
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },

  // Only look for specs in this package
  testMatch: ['<rootDir>/src/**/?(*.)+(spec|test).+(ts|tsx)'],
}

export default config
