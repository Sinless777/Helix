// Add missing repo issues/PRs to a Project v2 and set fields based on labels/state.
// Inputs:
//   - GITHUB_TOKEN (project scope)
//   - GITHUB_REPOSITORY (owner/name)
//   - GITHUB_REPOSITORY_OWNER
// Optional:
//   - PROJECT_NAME (defaults to first config in .github/projects)
//   - PROJECT_OWNER (override owner)
//
// Behavior:
//   - Ensures project exists (using config)
//   - Adds any repo issue/PR not already in the project
//   - Sets Status/Area/Priority fields using simple heuristics:
//       * PR merged/closed => Status: Done
//       * PR open => Status: Review
//       * Issue closed => Status: Done
//       * Issue label 'blocked' => Status: Blocked
//       * Otherwise => Status: Todo
//       * Area from labels: area:frontend/backend/infra/database/ai
//       * Priority from labels: priority:critical/high/medium/low

const { createGitHubClient } = require("../utils/graphql-client");
const { loadProjectConfigs } = require("../utils/config-loader");
const { ensureProject, getRepository } = require("./project-service");
const { fetchProjectFields } = require("./field-service");
const { info, warn, error, debug, formatError } = require("../utils/logger");

const token = process.env.GITHUB_TOKEN;
const repoFull = process.env.GITHUB_REPOSITORY;
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
const projectNameOverride = process.env.PROJECT_NAME;
const projectOwnerOverride = process.env.PROJECT_OWNER;

if (!token) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

async function fetchProjectItems(client, projectId) {
  const query = `
    query ($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 50, after: $after) {
            nodes {
              id
              content {
                ... on Issue { id number repository { nameWithOwner } state labels(first: 20) { nodes { name } } }
                ... on PullRequest { id number repository { nameWithOwner } state merged labels(first: 20) { nodes { name } } }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;
  const items = [];
  let after = null;
  while (true) {
    const res = await client(query, { projectId, after });
    const conn = res.node?.items;
    if (!conn) break;
    items.push(...(conn.nodes || []));
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return items;
}

async function fetchRepoIssuesAndPRs(client, owner, name) {
  const query = `
    query ($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        issues(first: 50, after: $after, states: [OPEN, CLOSED]) {
          nodes {
            id
            number
            state
            labels(first: 20) { nodes { name } }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `;
  const prQuery = `
    query ($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        pullRequests(first: 50, after: $after, states: [OPEN, CLOSED, MERGED]) {
          nodes {
            id
            number
            state
            merged
            labels(first: 20) { nodes { name } }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `;

  const collect = async (q, key) => {
    const records = [];
    let after = null;
    while (true) {
      const res = await client(q, { owner, name, after });
      const conn = res.repository?.[key];
      if (!conn) break;
      records.push(...(conn.nodes || []));
      if (!conn.pageInfo?.hasNextPage) break;
      after = conn.pageInfo.endCursor;
    }
    return records;
  };

  const issues = await collect(query, "issues");
  const prs = await collect(prQuery, "pullRequests");
  return { issues, prs };
}

async function addItemToProject(client, projectId, contentId) {
  const mutation = `
    mutation ($input: AddProjectV2ItemByIdInput!) {
      addProjectV2ItemById(input: $input) { item { id } }
    }
  `;
  await client(mutation, { input: { projectId, contentId } });
}

async function updateSingleSelectField(client, projectId, itemId, field, optionName) {
  if (!field || field.dataType !== "SINGLE_SELECT") return;
  const option = (field.options || []).find((o) => o.name.toLowerCase() === optionName.toLowerCase());
  if (!option) return;

  const mutation = `
    mutation ($input: UpdateProjectV2ItemFieldValueInput!) {
      updateProjectV2ItemFieldValue(input: $input) { projectV2Item { id } }
    }
  `;
  await client(mutation, {
    input: {
      projectId,
      itemId,
      fieldId: field.id,
      value: { singleSelectOptionId: option.id },
    },
  });
}

function labelSet(labels = []) {
  const set = new Set();
  for (const l of labels) {
    const name = l?.name || l;
    if (name) set.add(name.toLowerCase());
  }
  return set;
}

async function main() {
  const client = createGitHubClient(token);
  const [owner, repo] = (repoFull || "").split("/");
  if (!owner || !repo) throw new Error("GITHUB_REPOSITORY must be owner/name");

  info(`Backfilling project items for ${owner}/${repo}`);

  const repository = await getRepository(client, repoFull);
  const configs = loadProjectConfigs(undefined, projectOwnerOverride || repoOwner);
  if (!configs.length) throw new Error("No project configs found");

  const targetCfg =
    configs.find((c) => c.name === projectNameOverride) ||
    configs[0];
  if (!targetCfg) throw new Error("No matching project config");

  if (projectOwnerOverride) targetCfg.owner = projectOwnerOverride;
  const project = await ensureProject(client, targetCfg, repository);

  const fields = await fetchProjectFields(client, project.id);
  const fieldByName = (n) => fields.find((f) => f.name.toLowerCase() === n.toLowerCase());
  const statusField = fieldByName("Status");
  const areaField = fieldByName("Area");
  const priorityField = fieldByName("Priority");

  const projectItems = await fetchProjectItems(client, project.id);
  const existingContentIds = new Set(
    projectItems.map((it) => it.content && it.content.id).filter(Boolean)
  );

  const { issues, prs } = await fetchRepoIssuesAndPRs(client, owner, repo);
  info(`Found ${issues.length} issues and ${prs.length} PRs in repo; project has ${existingContentIds.size} items.`);

  let added = 0;
  const tasks = [
    ...issues.map((iss) => ({ type: "issue", data: iss })),
    ...prs.map((pr) => ({ type: "pr", data: pr })),
  ];

  for (const t of tasks) {
    const contentId = t.data.id;
    const labels = labelSet(t.data.labels?.nodes);
    if (existingContentIds.has(contentId)) {
      debug(`Item #${t.data.number} already in project`);
      continue;
    }
    await addItemToProject(client, project.id, contentId);
    added += 1;
    info(`Added ${t.type} #${t.data.number} to project.`);
  }

  // Update fields for all project items (new + existing) to ensure consistency.
  for (const item of projectItems) {
    const content = item.content;
    if (!content) continue;
    const labels = labelSet(content.labels?.nodes);

    // Status logic
    let status = null;
    if (content.__typename === "PullRequest" || t.type === "pr") {
      const isMerged = content.merged === true;
      const isClosed = content.state === "CLOSED" || content.state === "MERGED";
      status = isMerged || isClosed ? "Done" : "Review";
    } else {
      const isClosed = content.state === "CLOSED";
      if (labels.has("blocked")) status = "Blocked";
      else status = isClosed ? "Done" : "Todo";
    }
    if (statusField && status) {
      await updateSingleSelectField(client, project.id, item.id, statusField, status);
    }

    // Area mapping
    const areaMap = {
      "area:frontend": "Frontend",
      "area:backend": "Backend",
      "area:infra": "Infra",
      "area:database": "Database",
      "area:ai": "AI/ML",
    };
    for (const key of Object.keys(areaMap)) {
      if (labels.has(key) && areaField) {
        await updateSingleSelectField(client, project.id, item.id, areaField, areaMap[key]);
        break;
      }
    }

    // Priority mapping
    const prioMap = {
      "priority:critical": "Critical",
      "priority:high": "High",
      "priority:medium": "Medium",
      "priority:low": "Low",
    };
    for (const key of Object.keys(prioMap)) {
      if (labels.has(key) && priorityField) {
        await updateSingleSelectField(client, project.id, item.id, priorityField, prioMap[key]);
        break;
      }
    }
  }

  info(`Backfill complete. Added ${added} new items.`);
}

main().catch((err) => {
  error(formatError(err));
  process.exit(1);
});
