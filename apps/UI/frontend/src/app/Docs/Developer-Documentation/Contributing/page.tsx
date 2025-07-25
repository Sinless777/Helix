'use client'

import Header from '../../../../components/Header'
import { edges, nodes, headerProps } from '@helixai/core'
import { Box, Button, Container, Divider, Typography } from '@mui/material'
import * as React from 'react'
import ReactFlow, { ReactFlowProvider } from 'react-flow-renderer'

export default function ContributingPage() {
  // Commit linting guidelines
  const commitlintText = `Allowed Types: feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert | merge

Branch Prefixes:
  feature/*
  bugfix/*
  hotfix/*
  docs/*

Conventional Commits enforced via CI with @commitlint/config-conventional.`

  return (
    <Box sx={{ backgroundColor: 'transparent', color: 'white', flexGrow: 1 }}>
      <Header {...headerProps} />
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 4, md: 8, lg: 14 },
          pb: { xs: 6, md: 10 },
        }}
      >
        {/* Page Title */}
        <Typography variant="h3" component="h1" gutterBottom>
          Contributing to Helix
        </Typography>
        {/* Expanded Introduction */}
        <Typography variant="body1" gutterBottom>
          Thank you for your interest in contributing to Helix! Our project is
          driven by community collaboration, high code quality, and clear
          documentation. Whether you&apos;re fixing bugs, introducing new
          features, or improving our docs, your contributions make Helix
          stronger.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Below you&apos;ll find guidelines on our Git Flow branching model,
          commit conventions, pull request workflow, release process, and
          automated tooling. Please review each section carefully. If you have
          any questions or need assistance, feel free to join our Discord server
          or open an issue in our GitHub repo.
        </Typography>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Git Flow Diagram */}
        <Typography variant="h4" component="h2" gutterBottom>
          Git Flow Branching Model
        </Typography>
        <Typography variant="body1" gutterBottom>
          We follow the standard Git Flow model to organize our work:
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 4, '& li': { mb: 1 } }}>
          <li>
            <strong>develop</strong>: Main integration branch for ongoing work
          </li>
          <li>
            <strong>master</strong>: Stable production branch (releases are
            tagged here)
          </li>
          <li>
            <strong>feature/*</strong>: New features branched off{' '}
            <em>develop</em>
          </li>
          <li>
            <strong>bugfix/*</strong>: Non-critical fixes branched off{' '}
            <em>develop</em>
          </li>
          <li>
            <strong>hotfix/*</strong>: Critical production fixes branched off{' '}
            <em>master</em>
          </li>
          <li>
            <strong>docs/*</strong>: Documentation updates branched off{' '}
            <em>develop</em>
          </li>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: 500,
            backgroundColor: '#1A202C',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              panOnDrag={false}
              panOnScroll={false}
              style={{ width: '100%', height: '100%' }}
              attributionPosition="bottom-right"
            />
          </ReactFlowProvider>
        </Box>

        {/* Legend Section */}
        <Typography variant="h5" component="h3" gutterBottom>
          Legend & Notes
        </Typography>
        <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 }, mb: 6 }}>
          <li>
            <strong>feature/*</strong>: code for new features; branch off{' '}
            <code>develop</code>
          </li>
          <li>
            <strong>bugfix/*</strong>: fixes for non-critical issues; branch off{' '}
            <code>develop</code>
          </li>
          <li>
            <strong>hotfix/*</strong>: urgent fixes; branch off{' '}
            <code>master</code>
          </li>
          <li>
            <strong>docs/*</strong>: documentation improvements; branch off{' '}
            <code>develop</code>
          </li>
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Commit Conventions */}
        <Typography variant="h5" component="h3" gutterBottom>
          Commit Conventions & Prefixes
        </Typography>
        <Typography variant="body1" gutterBottom>
          We enforce Conventional Commits via CI to maintain a clear changelog:
        </Typography>
        <Box
          component="pre"
          sx={{
            background: '#1A202C',
            p: 3,
            borderRadius: 2,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            mb: 6,
          }}
        >
          {commitlintText}
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Pull Request Process */}
        <Typography variant="h4" component="h2" gutterBottom>
          Pull Request Process
        </Typography>
        <Box component="ol" sx={{ pl: 4, '& li': { mb: 1 }, mb: 6 }}>
          <li>
            <strong>Branch Creation:</strong> From <code>develop</code>, create
            a branch following the prefix guidelines (<em>feature/*</em>,{' '}
            <em>bugfix/*</em>, <em>docs/*</em>).
          </li>
          <li>
            <strong>Work and Commit:</strong> Make atomic commits with clear
            messages following Conventional Commits. Run local tests and lint
            before pushing.
          </li>
          <li>
            <strong>Open PR:</strong> Open a Pull Request targeting{' '}
            <code>develop</code>. Fill out the PR template, linking relevant
            issue numbers and providing screenshots or recordings for UI
            changes.
          </li>
          <li>
            <strong>Automated Checks:</strong> Ensure all GitHub Actions checks
            (tests, lint, type checks) pass. CI will enforce commitlint rules
            and run the test suite.
          </li>
          <li>
            <strong>Code Review:</strong> Reviewers (automatically assigned) and
            GitHub Copilot suggestions will provide feedback. Address review
            comments, push follow-up commits, and await approvals.
          </li>
          <li>
            <strong>Merge Strategy:</strong> Once approved and all checks pass,
            squash-and-merge the PR to maintain a clean history. Add a
            descriptive merge commit message if needed.
          </li>
          <li>
            <strong>Post-Merge:</strong> After merging, delete the branch in
            GitHub. The PR will be linked to changelog and future releases via
            semantic-release.
          </li>
          <li>
            <strong>Release Monitoring:</strong> Verify the new changes in the{' '}
            <code>develop</code> environment. Prepare any additional hotfix
            branches from <code>master</code> if urgent issues arise.
          </li>
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Release & Versioning */}
        <Typography variant="h4" component="h2" gutterBottom>
          Release & Versioning
        </Typography>
        <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 }, mb: 6 }}>
          <li>
            No <code>release/*</code> branches: versioning is fully automated.
          </li>
          <li>
            <code>semantic-release</code> analyzes merged commits on{' '}
            <code>master</code> to determine the next version according to
            Conventional Commit types.
          </li>
          <li>
            <code>Changesets</code> allow manual release notes and version
            control for multi-package repos; changeset files are committed
            alongside features.
          </li>
          <li>
            On merge to <code>master</code>, CI pipeline runs{' '}
            <code>semantic-release</code> which publishes to npm, creates GitHub
            releases, and updates the changelog.
          </li>
          <li>
            Tags (<code>vX.Y.Z</code>) are generated automatically and pushed to
            GitHub, triggering any downstream deployments.
          </li>
          <li>
            <code>develop</code> remains the integration branch; hotfixes
            branched off <code>master</code> are merged back to both{' '}
            <code>develop</code> and <code>master</code> as needed.
          </li>
          <li>
            Ensure commit messages on PRs are accurate and descriptive for
            reliable release notes and changelog entries.
          </li>
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Automatic Dependency & Linting Tooling */}
        <Typography variant="h4" component="h2" gutterBottom>
          Automated Dependency, Linting & Commit Tooling
        </Typography>
        <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 }, mb: 8 }}>
          <li>
            <strong>Renovate</strong> - automates dependency updates. Groups PRs
            by major/minor, applies your schedule, and can auto-merge safe
            upgrades.
          </li>
          <li>
            <strong>Dependabot</strong> - GitHub&apos;s built-in security
            scanner. Generates PRs for vulnerability fixes and keeps your
            lockfiles up to date.
          </li>
          <li>
            <strong>Husky</strong> + <strong>Lint-Staged</strong> - pre-commit
            Git hooks run on staged files to:
            <ul>
              <li>
                Run <code>eslint --fix</code> and <code>prettier --write</code>
              </li>
              <li>Catch formatting issues before you push</li>
            </ul>
          </li>
          <li>
            <strong>ESLint</strong> - enforces static code analysis rules. We
            use a shared config plus custom rules to keep code consistent.
          </li>
          <li>
            <strong>Prettier</strong> - code formatting. Plugins sort Tailwind
            classes, enforce semis, single quotes, print width, etc.
          </li>
          <li>
            <strong>Commitlint</strong> - validates Conventional Commits via{' '}
            <code>@commitlint/config-conventional</code>. Enforced in CI to
            guarantee a clean, machine-readable changelog.
          </li>
          <li>
            <strong>TypeScript (strict mode)</strong> - full type-safety. No{' '}
            <code>@ts-expect-error</code> allowed without justification.
          </li>
        </Box>

        <Button
          variant="contained"
          href="https://github.com/Sinless777/Helix/blob/master/CONTRIBUTING.md"
          sx={{ mt: 2, mb: 10 }}
        >
          View Full CONTRIBUTING.md
        </Button>
      </Container>
    </Box>
  )
}
