// .github/scripts/sync-projects-from-config.js
// Sync GitHub Projects v2 from YAML configs in .github/projects.
//
// Requirements (installed in workflow):
//   - js-yaml
//   - @octokit/graphql
//
// Permissions:
//   - workflow must have `contents: read`
//   - GITHUB_TOKEN (here: PROJECTS_TOKEN) must have access to create user/org projects

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { graphql } = require("@octokit/graphql");

const token = process.env.GITHUB_TOKEN;
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
const repoFull = process.env.GITHUB_REPOSITORY;

if (!token) {
  console.error("GITHUB_TOKEN is not set. Aborting.");
  process.exit(1);
}

const client = graphql.defaults({
  headers: {
    authorization: `token ${token}`,
  },
});

const PROJECTS_DIR = path.join(process.cwd(), ".github", "projects");

/**
 * Load all YAML project configuration files from .github/projects.
 */
function loadProjectConfigs() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log(`No project directory found at ${PROJECTS_DIR}, nothing to do.`);
    return [];
  }

  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const configs = [];

  for (const file of files) {
    const fullPath = path.join(PROJECTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const doc = yaml.load(raw);

    if (!doc || typeof doc !== "object") {
      console.warn(`Skipping ${file}: could not parse YAML.`);
      continue;
    }

    const project = doc.project || doc;

    if (!project || typeof project !== "object") {
      console.warn(`Skipping ${file}: no 'project' key found.`);
      continue;
    }

    const name = project.name;
    if (!name) {
      console.warn(`Skipping ${file}: project.name is required.`);
      continue;
    }

    const description = project.description || "";
    const owner = project.owner || repoOwner;
    const visibility = project.public === true ? "PUBLIC" : "PRIVATE";

    configs.push({
      sourceFile: file,
      owner,
      name,
      description,
      visibility,
      rawConfig: doc,
    });
  }

  return configs;
}

/**
 * Resolve a GitHub login (user/org) to an ownerId + ownerType.
 * We MUST query user and org separately, otherwise GraphQL will throw
 * NOT_FOUND for one of the paths and octokit will treat it as an error.
 */
async function getOwnerId(login) {
  // Try as user first
  const userQuery = `
    query($login: String!) {
      user(login: $login) {
        id
      }
    }
  `;

  try {
    const res = await client(userQuery, { login });
    if (res.user && res.user.id) {
      return { id: res.user.id, type: "USER" };
    }
  } catch (err) {
    // If it's NOT_FOUND or similar, we just fall through to try org
    console.log(`Login '${login}' is not a user or user not accessible, trying org...`);
  }

  // Then try as organization
  const orgQuery = `
    query($login: String!) {
      organization(login: $login) {
        id
      }
    }
  `;

  try {
    const res = await client(orgQuery, { login });
    if (res.organization && res.organization.id) {
      return { id: res.organization.id, type: "ORG" };
    }
  } catch (err) {
    console.log(`Login '${login}' is not an organization or org not accessible.`);
  }

  throw new Error(`Could not resolve owner '${login}' as user or org.`);
}

/**
 * Check if a project with a given title already exists for owner.
 */
async function findExistingProject(ownerLogin, title) {
  const query = `
    query($login: String!, $title: String!) {
      user(login: $login) {
        projectsV2(first: 50, query: $title) {
          nodes { id title }
        }
      }
      organization(login: $login) {
        projectsV2(first: 50, query: $title) {
          nodes { id title }
        }
      }
    }
  `;

  const result = await client(query, {
    login: ownerLogin,
    title,
  });

  const candidates = [];

  if (result.user && result.user.projectsV2) {
    candidates.push(...result.user.projectsV2.nodes);
  }

  if (result.organization && result.organization.projectsV2) {
    candidates.push(...result.organization.projectsV2.nodes);
  }

  const match = candidates.find((p) => p.title === title);
  return match || null;
}

/**
 * Create a new Project V2.
 */
async function createProject(ownerId, title, description) {
  const mutation = `
    mutation($ownerId: ID!, $title: String!, $desc: String) {
      createProjectV2(input: {
        ownerId: $ownerId,
        title: $title,
        shortDescription: $desc
      }) {
        projectV2 {
          id
          title
          url
        }
      }
    }
  `;

  const result = await client(mutation, {
    ownerId,
    title,
    desc: description || "",
  });

  return result.createProjectV2.projectV2;
}

(async () => {
  try {
    console.log(`Repository: ${repoFull}`);
    console.log(`Owner: ${repoOwner}`);
    console.log(`Scanning project configs in: ${PROJECTS_DIR}`);

    const configs = loadProjectConfigs();
    if (configs.length === 0) {
      console.log("No valid project configs found. Exiting.");
      return;
    }

    for (const cfg of configs) {
      console.log(
        `\n=== Processing project config from ${cfg.sourceFile} ===`
      );
      console.log(
        `Owner: ${cfg.owner} | Name: ${cfg.name} | Visibility: ${cfg.visibility}`
      );

      const ownerInfo = await getOwnerId(cfg.owner);
      console.log(
        `Resolved owner '${cfg.owner}' as ${ownerInfo.type} with id ${ownerInfo.id}`
      );

      const existing = await findExistingProject(cfg.owner, cfg.name);
      if (existing) {
        console.log(
          `Project already exists: '${cfg.name}' (id: ${existing.id}) – skipping create.`
        );
        continue;
      }

      console.log(`Creating new Project V2: '${cfg.name}' ...`);
      const project = await createProject(
        ownerInfo.id,
        cfg.name,
        cfg.description
      );
      console.log(
        `Created project '${project.title}' at ${project.url} (id: ${project.id})`
      );

      // NOTE:
      // At this point, you could extend this script to:
      // - Read cfg.rawConfig.fields / views / automation
      // - Use additional GraphQL mutations to create fields and automation rules
      // For now we only ensure the project shell exists.
    }

    console.log("\nAll project configs processed.");
  } catch (err) {
    console.error("Error while syncing projects from config:");
    console.error(err);
    process.exit(1);
  }
})();
