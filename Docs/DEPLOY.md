Deployment checklist — Vercel + publishing libs

This repo is a pnpm monorepo using Nx. I updated package scopes to @helix-ai/* and made the libs build/publish-ready.

Quick steps to deploy your frontend to Vercel and publish libs:

1) Locally (optional) — verify the workspace builds

   # install deps and rebuild the lockfile
   pnpm -w install

   # build everything
   pnpm -w -r build

2) Prepare NPM credentials for publishing (CI or locally)

   # On CI: add an environment variable named NPM_ACCESS_TOKEN with your npm token.
   # Locally: create a temporary .npmrc before publishing (do NOT commit it):
   echo "//registry.npmjs.org/:_authToken=${NPM_ACCESS_TOKEN}" > .npmrc

   # Template is provided at .npmrc.template

3) Publish libs to npm (optional, and only if you want to publish)

   # This will run `pnpm -w -r publish --access public` (requires proper npm token)
   pnpm publish:libs

4) Deploy to Vercel using the Vercel CLI

   # login and optionally link the project
   vercel login
   cd <repo-root>
   vercel link

   # make sure the project on Vercel has the environment variables set (in the dashboard or via the CLI):
   # add NPM_ACCESS_TOKEN to the Vercel project (if you need it during build/publish)
   vercel env add NPM_ACCESS_TOKEN production

   # then deploy (production)
   vercel --prod

Notes & tips
- I updated `vercel.json` to run `pnpm -w -r vercel-build` as the build command which executes the monorepo build and then builds the frontend.
- After renaming packages, regenerate lockfile with `pnpm -w install` to keep pnpm-lock.yaml consistent.
- I did NOT commit any secret tokens. Use `.npmrc.template` as guidance for CI setup.
- If you want me to run the local vercel commands here, tell me and provide any required auth (I cannot access secrets nor log in to Vercel from this environment). I can, however, produce the exact CLI commands you should run locally or in CI.
