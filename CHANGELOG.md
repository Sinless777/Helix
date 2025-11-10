# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.2.0](https://github.com/Sinless777/Helix/compare/v1.1.9...v1.2.0) (2025-11-10)


### Features

* Enhance e2e tests and UI components for improved user experience and functionality ([9fcbcc2](https://github.com/Sinless777/Helix/commit/9fcbcc24cf95be8eba355dac9c9366ef9eb1769f))


### Bug Fixes

* Add build target dependency to targetDefaults in nx.json ([17f521d](https://github.com/Sinless777/Helix/commit/17f521db3fcce0a41d13a31f2e836306edc98729))
* Adjust TypeScript configuration and update Cypress command namespace handling ([6148298](https://github.com/Sinless777/Helix/commit/61482987fa242724c97d0c5f4e34bb1c360ebf03))
* Remove NX_CLOUD_ACCESS_TOKEN and clean up publish workflow ([a2cb775](https://github.com/Sinless777/Helix/commit/a2cb7750f42d8f62dd9da5bc9b7adbbf6a8f6d8b))
* Remove unused scripts and dependencies from package.json and pnpm-lock.yaml; clean up pnpm workspace configuration ([24be2e9](https://github.com/Sinless777/Helix/commit/24be2e913aea1212a0b455b0c6f566f5e67fcc51))
* Simplify next.config.js by removing Nx-specific options and legacy code ([8e09cc4](https://github.com/Sinless777/Helix/commit/8e09cc44598b63cf048b33a7021e775e4bce77ff))
* Update pnpm setup to version 10.18.0 and streamline version bump process ([9ec006c](https://github.com/Sinless777/Helix/commit/9ec006cebf984c465441fc15b04191962d975c82))
* Update publish workflow and dependencies; remove unused files and scripts ([64be4a3](https://github.com/Sinless777/Helix/commit/64be4a3aaab2a7a295783360d4f1f7d0dddd856c))
* Update publish workflow to use pnpm and improve caching strategies ([9280697](https://github.com/Sinless777/Helix/commit/92806971e47e58937e389d92013957c46e18c6bd))
* Update tsconfig.lib.json to correct rootDir and enhance declaration options ([a3cce63](https://github.com/Sinless777/Helix/commit/a3cce631a9149ae6d678f479d75403b90e978d96))
* Update workflow name and streamline publish steps in publish-libs.yaml ([97b8b6b](https://github.com/Sinless777/Helix/commit/97b8b6b111e1e340d51320778d16f21c4de2c5c1))

### [1.1.9](https://github.com/Sinless777/Helix/compare/v1.1.8...v1.1.9) (2025-11-09)

### [1.1.8](https://github.com/Sinless777/Helix/compare/v1.1.7...v1.1.8) (2025-11-08)


### Bug Fixes

* Remove emitDeclarationOnly option from tsconfig.lib.json for clarity ([179d705](https://github.com/Sinless777/Helix/commit/179d7056073eab30da88c04a358e2f04055d559a))

### [1.1.7](https://github.com/Sinless777/Helix/compare/v1.1.6...v1.1.7) (2025-11-08)


### Bug Fixes

* Add NPM_ACCESS_TOKEN to environment variables for consistency ([205b0f6](https://github.com/Sinless777/Helix/commit/205b0f63f5890fdf56338dd05af452cf281bb9b1))

### [1.1.6](https://github.com/Sinless777/Helix/compare/v1.1.5...v1.1.6) (2025-11-08)


### Bug Fixes

* Remove --no-cache option from build step for consistency ([21201c7](https://github.com/Sinless777/Helix/commit/21201c71c0852111a86eb974ff2e6619c46e7f4a))

### [1.1.5](https://github.com/Sinless777/Helix/compare/v1.1.4...v1.1.5) (2025-11-08)


### Bug Fixes

* Add CI fix step to ensure consistency before building workspace ([62542e4](https://github.com/Sinless777/Helix/commit/62542e48b9c0d672d47178412695c6a6c736ffba))

### [1.1.4](https://github.com/Sinless777/Helix/compare/v1.1.3...v1.1.4) (2025-11-08)


### Bug Fixes

* Add --no-cache option to build step for improved performance ([e823f52](https://github.com/Sinless777/Helix/commit/e823f5200b9bbdbc2e21ddd189868566c4eb62b4))

### [1.1.3](https://github.com/Sinless777/Helix/compare/v1.1.2...v1.1.3) (2025-11-08)


### Bug Fixes

* Move permissions section to the top of the publish workflow for better visibility ([26063ff](https://github.com/Sinless777/Helix/commit/26063ffc9e932207bef0d9d73bda7e27f21fb780))

### [1.1.2](https://github.com/Sinless777/Helix/compare/v1.1.1...v1.1.2) (2025-11-08)


### Bug Fixes

* Remove unnecessary --all flag from build command in publish workflow ([689372d](https://github.com/Sinless777/Helix/commit/689372d868af8c3d72077000fe7b16c4f37ae43c))

### [1.1.1](https://github.com/Sinless777/Helix/compare/v1.1.0...v1.1.1) (2025-11-08)


### Bug Fixes

* Update rootDir in tsconfig.lib.json for correct directory structure ([ae1fc16](https://github.com/Sinless777/Helix/commit/ae1fc16e689bfef3bf976ff804b71d9dff142fd5))

## 1.1.0 (2025-11-08)


### Features

* Add integration entities for connectors and secrets ([0d10a52](https://github.com/Sinless777/Helix/commit/0d10a522cf3edcb5fb147d7295350d70164778bf))
* Add maintenance and security issue templates for better tracking ([e82b819](https://github.com/Sinless777/Helix/commit/e82b819e9a50bf9fdd594192c4d796eac6e57a2b))
* Add OpenAI dependency to project ([50de199](https://github.com/Sinless777/Helix/commit/50de199418346d8d66653b09f508347fbd99ba26))
* Refactor project structure and update package scopes to [@helix-ai](https://github.com/helix-ai). Enhance CI deployment process with new workflows and scripts for publishing libraries. ([fc2ee6a](https://github.com/Sinless777/Helix/commit/fc2ee6a44b0d821e65b3e32d9b72e63627a2d06d))


### Bug Fixes

* Correct OpenAI API initialization in release notes script ([41b2339](https://github.com/Sinless777/Helix/commit/41b2339bdcaf69e91ec25b142add3cea9bd47bb2))
* Refactor OpenAI API usage in release notes script ([d940161](https://github.com/Sinless777/Helix/commit/d94016148ad49d59dd204fb03bc06e7aaaf049bc))
* Update permissions to allow write access for contents in publish workflow ([200d7ca](https://github.com/Sinless777/Helix/commit/200d7ca7b6bf38d87adabe60d028d10921d52895))
