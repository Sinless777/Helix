const base = require('../../jest.config.base')
const fs = require('fs')
const path = require('path')

// Load local .swcrc config manually (Jest doesn't auto-read it)
const { exclude, ...swcConfig } = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.swcrc'), 'utf-8'),
)

module.exports = {
  displayName: '@helix/logger',
  rootDir: '.',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', { ...swcConfig, swcrc: false }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/libs/logger',
}
