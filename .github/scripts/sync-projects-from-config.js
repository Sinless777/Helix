// .github/scripts/sync-projects-from-config.js
// Sync GitHub Projects v2 from YAML configs in .github/projects.
//
// Requirements:
//   - js-yaml
//   - @octokit/graphql
//
// Permissions:
//   - workflow must have `contents: read`
//   - GITHUB_TOKEN (or PAT) must have `project` scope

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
 */
async function getOwnerId(login) {
  const userQuery = `
    query($login:String!){
      user(login:$login){ id }
    }
  `;
  try {
    const res = await client(userQuery, { login });
    if (res.user && res.user.id) {
      return { id: res.user.id, type: "USER" };
    }
  } catch (err) {
    console.log(`Login '${login}' is not a user or not accessible, trying org...`);
  }

  const orgQuery = `
    query($login:String!){
      organization(login:$login){ id }
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

/**
 * Check if a Project V2 with a given title already exists for owner.
 */
async function findExistingProject(ownerLogin, title) {
  const userQuery = `
    query($login:String!, $title:String!){
      user(login:$login){
        projectsV2(first:50, query:$title){
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
    console.log(`Could not query user projects for '${ownerLogin}', trying org.`);
  }

  const orgQuery = `
    query($login:String!, $title:String!){
      organization(login:$login){
        projectsV2(first:50, query:$title){
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

/**
 * Update a project's short description.
 */
async function updateProjectDescription(projectId, description) {
  if (!description || !description.trim()) {
    return;
  }

  const mutation = `
    mutation($projectId:ID!, $desc:String!) {
      updateProjectV2(input:{
        projectId:$projectId,
        shortDescription:$desc
      }) {
        projectV2 { id shortDescription }
      }
    }
  `;
  return client(mutation, { projectId, desc: description });
}

/**
 * Get repository node id for current repo.
 */
async function getRepositoryNodeId(owner, name) {
  const query = `
    query($owner:String!, $name:String!) {
      repository(owner:$owner, name:$name) { id }
    }
  `;
  const res = await client(query, { owner, name });
  return res.repository.id;
}

/**
 * Link a project to a repository (so it shows in the repo's Projects tab).
 */
async function linkProjectToRepo(projectId, repositoryId) {
  const mutation = `
    mutation($input: LinkProjectV2ToRepositoryInput!) {
      linkProjectV2ToRepository(input:$input) {
        clientMutationId
      }
    }
  `;
  return client(mutation, { input: { projectId, repositoryId } });
}

/**
 * Map YAML field type → GitHub ProjectV2FieldType.
 */
function mapFieldType(yamlType) {
  if (!yamlType) return "TEXT";

  const t = String(yamlType).toLowerCase();

  switch (t) {
    case "single_select":
    case "single-select":
    case "single select":
      return "SINGLE_SELECT";
    case "number":
      return "NUMBER";
    case "text":
      return "TEXT";
    case "iteration":
      return "ITERATION";
    case "date":
      return "DATE";
    default:
      console.warn(`Unknown field type '${yamlType}', defaulting to TEXT.`);
      return "TEXT";
  }
}

/**
 * Fetch all existing fields on a project, keyed by name.
 */
async function getProjectFields(projectId) {
  const query = `
    query($projectId:ID!) {
      node(id:$projectId) {
        ... on ProjectV2 {
          fields(first:50) {
            nodes {
              ... on ProjectV2FieldCommon {
                id
                name
                dataType
              }
            }
          }
        }
      }
    }
  `;

  const res = await client(query, { projectId });
  const nodes =
    res.node &&
    res.node.fields &&
    Array.isArray(res.node.fields.nodes)
      ? res.node.fields.nodes
      : [];

  const map = new Map();
  for (const f of nodes) {
    if (f && f.name) {
      map.set(f.name, { id: f.id, dataType: f.dataType });
    }
  }
  return map;
}

/**
 * Create a single field on the project from YAML definition.
 */
async function createField(projectId, fieldDef) {
  const dataType = mapFieldType(fieldDef.type);
  const input = {
    projectId,
    name: fieldDef.name,
    dataType,
  };

  if (dataType === "SINGLE_SELECT" && Array.isArray(fieldDef.options)) {
    input.singleSelectOptions = fieldDef.options.map((opt) => ({
      name: opt.name,
      color: opt.color,
    }));
  }

  const mutation = `
    mutation($input: CreateProjectV2FieldInput!) {
      createProjectV2Field(input:$input) {
        projectV2Field {
          ... on ProjectV2FieldCommon {
            id
            name
            dataType
          }
        }
      }
    }
  `;

  const res = await client(mutation, { input });
  const created =
    res &&
    res.createProjectV2Field &&
    res.createProjectV2Field.projectV2Field;

  if (created) {
    console.log(
      `Created field '${created.name}' (type: ${created.dataType}, id: ${created.id})`
    );
  } else {
    console.log(
      `Field creation for '${fieldDef.name}' returned no projectV2Field payload.`
    );
  }
}

/**
 * Ensure all YAML-defined fields exist on the project.
 * (Adds new fields, leaves existing ones in place.)
 */
async function ensureProjectFields(projectId, cfg) {
  const fieldDefs = (cfg && cfg.fields) || [];
  if (!fieldDefs.length) {
    console.log("No fields defined in config; skipping field sync.");
    return;
  }

  console.log("Syncing project fields from config...");
  const existingMap = await getProjectFields(projectId);

  for (const fieldDef of fieldDefs) {
    if (!fieldDef || !fieldDef.name) {
      console.warn("Encountered field with no name in config, skipping.");
      continue;
    }

    if (existingMap.has(fieldDef.name)) {
      const existing = existingMap.get(fieldDef.name);
      console.log(
        `Field '${fieldDef.name}' already exists (type: ${existing.dataType}, id: ${existing.id}) – skipping create.`
      );
      continue;
    }

    try {
      await createField(projectId, fieldDef);
    } catch (err) {
      console.log(
        `Failed to create field '${fieldDef.name}': ${err.message}`
      );
    }
  }
}

/**
 * High-level sync of "extras" from YAML:
 *  - fields: created via GraphQL
 *  - views: logged (manual step)
 *  - automation: logged (manual step)
 */
async function syncProjectExtras(projectId, cfg, description) {
  // Always re-apply description so edits in YAML propagate.
  if (description && description.trim()) {
    try {
      await updateProjectDescription(projectId, description);
      console.log("Updated project description from config.");
    } catch (err) {
      console.log(
        `Failed to update description for project ${projectId}: ${err.message}`
      );
    }
  }

  await ensureProjectFields(projectId, cfg);

  const views = (cfg && cfg.views) || [];
  if (views.length) {
    console.log(
      "Views are defined in YAML, but GitHub's GraphQL API does not yet expose full view/layout configuration.\n" +
        "Please configure these views manually in the UI. Parsed views configuration:"
    );
    console.log(JSON.stringify(views, null, 2));
  }

  const automation = (cfg && cfg.automation) || [];
  if (automation.length) {
    console.log(
      "Automation rules are defined in YAML, but GitHub Projects v2 automation is not fully configurable via GraphQL.\n" +
        "Please configure equivalent workflows/automations manually in the UI. Parsed automation configuration:"
    );
    console.log(JSON.stringify(automation, null, 2));
  }
}

/**
 * Create a new Project V2 and optionally link it to the repository.
 */
async function createProject(ownerId, title, description, repoNodeId) {
  const mutation = `
    mutation($input:CreateProjectV2Input!) {
      createProjectV2(input:$input) {
        projectV2 { id title url }
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
      console.log(
        `Created project '${title}', but failed to set description: ${err.message}`
      );
    }
  }

  if (repoNodeId) {
    try {
      const linkResult = await linkProjectToRepo(project.id, repoNodeId);
      console.log(`Link result for project '${title}':`, linkResult);
      console.log(
        `Attempted to link project '${title}' to repository ${repoFull}`
      );
    } catch (err) {
      console.log(
        `Project '${title}' created, but failed to link repository: ${err.message}`
      );
    }
  }

  return project;
}

(async () => {
  try {
    console.log(`Repository: ${repoFull}`);
    console.log(`Owner: ${repoOwner}`);
    console.log(`Scanning project configs in: ${PROJECTS_DIR}`);

    const configs = loadProjectConfigs();
    if (!configs.length) {
      console.log("No valid project configs found. Exiting.");
      return;
    }

    const [ownerName, repoName] = repoFull.split("/");
    const repoNodeId = await getRepositoryNodeId(ownerName, repoName);

    for (const cfg of configs) {
      console.log(`\n=== Processing ${cfg.sourceFile} ===`);
      console.log(
        `Owner: ${cfg.owner} | Name: ${cfg.name} | Visibility: ${cfg.visibility}`
      );

      const ownerInfo = await getOwnerId(cfg.owner);
      console.log(
        `Resolved owner '${cfg.owner}' as ${ownerInfo.type} (id: ${ownerInfo.id})`
      );

      const existing = await findExistingProject(cfg.owner, cfg.name);
      if (existing) {
        console.log(
          `Project already exists: '${cfg.name}' (id: ${existing.id}) — updating from config.`
        );

        // Ensure it is linked to this repository (best-effort)
        try {
          const linkResult = await linkProjectToRepo(existing.id, repoNodeId);
          console.log(
            `Link result for existing project '${cfg.name}':`,
            linkResult
          );
        } catch (err) {
          console.log(
            `Failed to link existing project '${cfg.name}': ${err.message}`
          );
        }

        // Always sync metadata/fields/views/automation for existing projects
        await syncProjectExtras(existing.id, cfg.rawConfig, cfg.description);
        continue;
      }

      console.log(`Creating new Project V2: '${cfg.name}' ...`);
      const project = await createProject(
        ownerInfo.id,
        cfg.name,
        cfg.description,
        repoNodeId
      );
      console.log(
        `Created project '${project.title}' at ${project.url} (id: ${project.id})`
      );

      // Sync metadata/fields/views/automation for newly created project
      await syncProjectExtras(project.id, cfg.rawConfig, cfg.description);
    }

    console.log("\nAll project configs processed.");
  } catch (err) {
    console.error("Error while syncing projects from config:");
    console.error(err);
    process.exit(1);
  }
})();
