// .github/scripts/publish.js
const fs = require('fs');
const { execSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  const result = execSync(cmd, { stdio: 'inherit', ...opts });
  return result;
}

async function main() {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.setFailed('GITHUB_TOKEN is not set');
      return;
    }
    const npmToken = process.env.NPM_TOKEN;
    if (!npmToken) {
      core.setFailed('NPM_TOKEN (or equivalent) is not set');
      return;
    }

    const { owner, repo } = github.context.repo;
    const octokit = github.getOctokit(token);

    // 1. Read package.json (assuming root).
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = pkg.version;
    console.log(`Current version: ${version}`);

    // 2. Bump version if needed (you might integrate standard-version or semantic-release instead)
    // For simplicity, assume version already bumped & tag created by workflow.
    // Optionally validate tag matches version:
    const tagFromEnv = process.env.GITHUB_REF?.replace('refs/tags/', '');
    if (!tagFromEnv) {
      core.warning('No tag found in GITHUB_REF — continuing without tag-validation');
    } else if (tagFromEnv !== `v${version}`) {
      core.warning(`Tag ${tagFromEnv} does not match version v${version}`);
    }

    // 3. Set up NPM auth
    console.log('Setting up npm registry authentication');
    fs.writeFileSync('.npmrc', `//registry.npmjs.org/:_authToken=${npmToken}\n`);

    // 4. Run build (if you have a build step)
    console.log('Running build step');
    run('pnpm -w run build');

    // 5. Publish packages: e.g., with pnpm
    console.log('Publishing packages');
    run('pnpm -w -r publish --access public --no-git-checks');

    // 6. (Optional) Create GitHub release via API
    console.log('Creating GitHub release');
    const releaseResponse = await octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: tagFromEnv || `v${version}`,
      name: `Release ${version}`,
      body: `Published version ${version}`
    });
    console.log('Release created: ', releaseResponse.data.html_url);

    core.info(`✅ Publish process complete for version ${version}`);

  } catch (err) {
    core.setFailed(`Publishing failed: ${err.message}`);
  }
}

main();
