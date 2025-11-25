// .github/scripts/sync-projects-from-config.js
// Sync GitHub Projects v2 from YAML configs in .github/projects.
//
// Requirements (installed in workflow):
//   - js-yaml
//   - @octokit/graphql
//
// Permissions:
//   - workflow must have `contents: read`
//   - GITHUB_TOKEN (here: PROJECTS_TOKEN or GITHUB_TOKEN) must have
//     `project` scope to create user/org projects.

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

/** Load all YAML project configuration files. */
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

/** Resolve a GitHub login (user/org) to an ownerId + ownerType. */
async function getOwnerId(login) {
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
    // Not a user or not accessible
    console.log(`Login '${login}' is not a user or not accessible, trying org...`);
  }

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
    console.log(`Login '${login}' is not an organization or not accessible.`);
  }

  throw new Error(`Could not resolve owner '${login}' as user or org.`);
}

/** Check existing Project V2 for owner/title. */
async function findExistingProject(ownerLogin, title) {
  const userQuery = `
    query($login: String!, $title: String!) {
      user(login: $login) {
        projectsV2(first:50, query:$title) {
          nodes { id title }
        }
      }
    }
  `;
  try {
    const res = await client(userQuery, { login: ownerLogin, title });
    if (res.user && res.user.projectsV2) {
      const nodes = res.user.projectsV2.nodes || [];
      const match = nodes.find((p) => p.title === title);
      if (match) return match;
    }
  } catch (err) {
    console.log(`Could not query user projects for '${ownerLogin}', trying org projects...`);
  }

  const orgQuery = `
    query($login: String!, $title: String!) {
      organization(login: $login) {
        projectsV2(first:50, query:$title) {
          nodes { id title }
        }
      }
    }
  `;
  try {
    const res = await client(orgQuery, { login: ownerLogin, title });
    if (res.organization && res.organization.projectsV2) {
      const nodes = res.organization.projectsV2.nodes || [];
      const match = nodes.find((p) => p.title === title);
      if (match) return match;
    }
  } catch (err) {
    console.log(`Could not query organization projects for '${ownerLogin}'.`);
  }

  return null;
}

/** Update a project's description. */
async function updateProjectDescription(projectId, description) {
  const mutation = `
    mutation($projectId:ID!, $desc:String!) {
      updateProjectV2(input:{
        projectId:$projectId,
        shortDescription:$desc
      }) {
        projectV2 {
          id
          shortDescription
        }
      }
    }
  `;
  return client(mutation, { projectId, desc: description });
}

/** Create a new Project V2. */
async function createProject(ownerId, title, description) {
  const mutation = `
    mutation($input:CreateProjectV2Input!) {
      createProjectV2(input:$input) {
        projectV2 {
          id
          title
          url
        }
      }
    }
  `;
  const input = {
    ownerId,
    title,
    clientMutationId: `helix-sync-${Date.now()}`,
  };

  const result = await client(mutation, { input });
  const project = result.createProjectV2.projectV2;

  if (description && description.trim()) {
    try {
      await updateProjectDescription(project.id, description);
    } catch (err) {
      console.log(`Created project '${title}', but failed to set description: ${err.message}`);
    }
  }

  // NOTE: Repository linking (linkProjectV2ToRepository) may be not yet supported for user-owned projects
  // and GraphQL may return errors. Discussion: “Need way to link a ProjectV2 to a Repository” :contentReference[oaicite:1]{index=1}
  // You can add linking logic here when the mutation becomes fully supported.

  return project;
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
      console.log(`\n=== Processing project config from ${cfg.sourceFile} ===`);
      console.log(`Owner: ${cfg.owner} | Name: ${cfg.name} | Visibility: ${cfg.visibility}`);

      const ownerInfo = await getOwnerId(cfg.owner);
      console.log(`Resolved owner '${cfg.owner}' as ${ownerInfo.type} with id ${ownerInfo.id}`);

      const existing = await findExistingProject(cfg.owner, cfg.name);
      if (existing) {
        console.log(`Project already exists: '${cfg.name}' (id: ${existing.id}) – skipping create.`);
        continue;
      }

      console.log(`Creating new Project V2: '${cfg.name}' ...`);
      const project = await createProject(ownerInfo.id, cfg.name, cfg.description);
      console.log(`Created project '${project.title}' at ${project.url} (id: ${project.id})`);
    }

    console.log("\nAll project configs processed.");
  } catch (err) {
    console.error("Error while syncing projects from config:");
    console.error(err);
    process.exit(1);
  }
})();
