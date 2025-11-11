# Contributing to Helix AI

Thanks for helping build the Helix AI platform. This document covers the expectations for contributors, the workflow we follow, and the tools you’ll need to ship high-quality changes in this Nx monorepo.

## Core Principles

- **Be kind and inclusive.** All interactions are governed by the [Code of Conduct](./CODE_OF_CONDUCT.md).
- **Default to transparency.** Document decisions in PR descriptions, issues, or the `Docs/` folder so the wider community can follow along.
- **Security-first mindset.** Treat every contribution—especially plugins, workflows, and infrastructure changes—with zero-trust assumptions.
- **Quality through automation.** Let Nx drive builds, linting, and tests so CI and local workflows stay consistent.

## Before You Start

### Prerequisites

- Node.js 20 LTS (or newer) with `corepack` enabled.
- `pnpm` 10.x (the workspace root is configured as a pnpm workspace).
- Nx 22 CLI (optional but helpful): `pnpm dlx nx --version`.
- Access to any required env vars or third-party credentials (see `Docs/DEPLOY.md` and the README sections on infrastructure).

### Local Setup

1. **Fork & clone** the repository.
2. **Install dependencies:** `pnpm install`.
3. **Sync env files:** populate any `.env` files required by the project you’re changing (for example the frontend or Nest services). Keep secrets out of Git history.
4. **Explore the graph (optional):** `pnpm dlx nx graph` helps visualize dependencies across `apps/` and `libs/`.

> ⚠️ Always run workspace tasks through `nx run`, `nx run-many`, or `nx affected` rather than invoking the underlying tool directly. This keeps caching and dependency tracking accurate.

## Ways to Contribute

- **Bug reports:** file an issue with reproduction steps, expected behavior, and environment info.
- **Feature proposals:** outline the use case, success metrics, and any API or UX considerations. Early discussion in the issue tracker or Discord keeps work aligned.
- **Docs & tutorials:** update `Readme.md`, files under `Docs/`, or inline comments whenever behavior changes.
- **Testing & QA:** expand Jest unit tests, Cypress e2e coverage, or add smoke tests for the Nest services.
- **Tooling & workflows:** improvements to Nx targets, CI steps, or developer experience are always welcome.

## Development Workflow

1. **Pick or open an issue.** Comment to be assigned so efforts aren’t duplicated.
2. **Create a feature branch** from `main`. Suggested naming:  
   - `feat/<short-scope>` for new features  
   - `fix/<short-scope>` for bug fixes  
   - `chore/<short-scope>` for tooling or documentation
3. **Build iteratively.** Keep commits focused and follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat: add org switcher`, `fix(frontend): debounce search`, etc.).
4. **Run the relevant Nx targets** (see below) before opening a PR.
5. **Update docs and samples** if behavior changes or new config is required.
6. **Open a pull request** with:
   - Linked issue
   - Summary of changes + screenshots for UI work
   - Testing evidence (`nx test`, `nx e2e`, manual steps)
   - Notes on migrations or follow-up work
7. **Address review feedback** promptly; keep discussions public inside the PR when possible.

## Common Nx Commands

| Purpose                                       | Command                                               |
| --------------------------------------------- | ----------------------------------------------------- |
| Start the Next.js frontend                    | `pnpm exec nx run frontend:dev`                       |
| Build the frontend for production             | `pnpm exec nx run frontend:build`                     |
| Run Cypress tests                             | `pnpm exec nx run frontend-e2e:e2e`                   |
| Serve the Nest user service                   | `pnpm exec nx run services-user:serve`                |
| Test the Nest service                         | `pnpm exec nx run services-user:test`                 |
| Lint any project                              | `pnpm exec nx run <project>:lint`                     |
| Build shared libs (config, db, hypertune, ui) | `pnpm exec nx run <lib>:build`                        |
| Format code                                   | `pnpm exec nx format:write` (or `format:check` in CI) |
| Affected targets after a change               | `pnpm exec nx affected --target=lint,test,build`      |

> Replace `<project>`/`<lib>` with the actual Nx project name (see `nx graph` or `pnpm exec nx show projects`). When adding a new project, include its `project.json` so Nx can infer commands.

## Coding Guidelines

- **Language:** TypeScript everywhere (Next.js, NestJS, and libraries); favor strict typing and avoid `any`.
- **Styling & linting:** The repo uses ESLint + Prettier configs. Fix issues via `pnpm exec nx run <project>:lint --fix` or `pnpm exec nx format:write`.
- **UI components:** Export client components from `libs/ui/src/index.ts` and follow the existing `components/`, `theme/`, and provider conventions. Pair new UI with Storybook examples if applicable.
- **Config & secrets:** Centralize shared runtime configuration in `libs/config`. Do not hardcode credentials—use environment variables and document new keys.
- **Database layer:** Extend MikroORM entities in `libs/db`. Run migrations separately and describe schema changes in the PR.
- **Feature flags:** Leverage `libs/hypertune` for runtime experiments instead of ad-hoc boolean checks.
- **Testing:** Prefer Jest for units/integration and Cypress or Jest e2e projects for end-to-end coverage. Every bug fix should include a regression test when practical.

## Pull-Request Checklist

- [ ] Issue linked and scope clearly stated.
- [ ] Code follows repo style guides and includes relevant types.
- [ ] New env vars, config flags, or permissions documented.
- [ ] `pnpm exec nx affected --target=lint,test,build` (or equivalent per-project commands) has been run locally.
- [ ] Screenshots or recordings added for UI changes.
- [ ] Documentation updated (README, Docs/, or in-code comments).
- [ ] No secrets or proprietary data included in commits.

## Release & Versioning Notes

- The repo uses `standard-version` to manage release notes and semantic versioning. Keep commits conventional so changelog generation stays accurate.
- Polyform Noncommercial licensing applies. By contributing, you agree your work is released under the repository’s existing license.

## Need Help?

- **Discord:** [Community server](https://discord.gg/Za8MVstYnr) for quick questions.
- **GitHub Discussions/Issues:** Best place for feature requests and bug reports.
- **Docs:** Browse the `Docs/` directory for deployment, integrations, and entity reference materials.

Thanks again for contributing—Helix is better with your ideas and pull requests!
