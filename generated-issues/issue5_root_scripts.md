# Missing Root Lint/Test Scripts

`package.json` defines individual scripts for each workspace package but lacks top-level `lint` and `test` commands. Running `npm run lint` or `npm run test` fails.

**Suggested actions**:
- Add scripts such as `"lint": "pnpm run lint:all"` and `"test": "pnpm run test:all"` in the root `package.json` so contributors can run them easily.
