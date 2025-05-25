import { readFileSync } from 'fs'
import { join } from 'path'

// Load local .swcrc config manually (Jest doesn't auto-read it)
const { exclude, ...swcConfig } = JSON.parse(
  readFileSync(join(__dirname, '.swcrc'), 'utf-8'),
)

export const displayName = '@helix/logger'
export const rootDir = '.'
export const transform = {
  '^.+\\.[tj]s$': [
    '@swc/jest',
    { ...swcConfig, swcrc: false, tsconfig: false },
  ],
}
export const moduleFileExtensions = ['ts', 'js', 'json']
export const testEnvironment = 'node'
export const coverageDirectory = '../../coverage/libs/logger'
