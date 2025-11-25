// Sync GitHub Projects v2 from YAML configs in .github/projects.
//
// Requirements:
//   - js-yaml
//   - @octokit/graphql
//
// Permissions:
//   - workflow must have `contents: read`
//   - GITHUB_TOKEN (or PAT) must have `project` scope

const { createGitHubClient } = require("../utils/graphql-client");
const { loadProjectConfigs } = require("../utils/config-loader");
const { ensureProject, getRepository } = require("./project-service");
const { syncFields } = require("./field-service");
const { syncViews } = require("./view-service");
const { syncAutomation } = require("./automation-service");
const { info, warn, error, formatError } = require("../utils/logger");

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
  const repoFull = process.env.GITHUB_REPOSITORY;

  info(`Starting project sync with repo=${repoFull} owner=${repoOwner}`);
  const client = createGitHubClient(token);
  const configs = loadProjectConfigs(undefined, repoOwner);

  if (!configs.length) {
    info("No project configs found. Exiting.");
    return;
  }

  let repository = null;
  if (repoFull) {
    try {
      repository = await getRepository(client, repoFull);
      info(`Repository resolved: ${repository.nameWithOwner}`);
    } catch (err) {
      warn(`Unable to resolve repository '${repoFull}' for linking: ${formatError(err)}`);
    }
  } else {
    warn("GITHUB_REPOSITORY env var not set; skipping repository linking.");
  }

  for (const cfg of configs) {
    info(`\n--- Syncing project from ${cfg.sourceFile} (${cfg.name}) ---`);
    info(
      `Config summary -> owner=${cfg.owner}, public=${cfg.public}, fields=${cfg.fields.length}, views=${cfg.views.length}, automation=${cfg.automation.length}`
    );
    try {
      const project = await ensureProject(client, cfg, repository);
      await syncFields(client, project.id, cfg.fields);
      await syncViews(client, project.id, cfg.views);
      await syncAutomation(client, project.id, cfg.automation);
      info(`Finished sync for '${cfg.name}' (${project.url || project.id}).`);
    } catch (err) {
      error(`Failed to sync project '${cfg.name}': ${formatError(err)}`);
      process.exitCode = 1;
    }
  }
}

run().catch((err) => {
  error(`Unexpected failure: ${formatError(err)}`);
  process.exit(1);
});
