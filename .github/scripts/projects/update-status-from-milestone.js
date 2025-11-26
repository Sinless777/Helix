const fs = require("fs");
const { createGitHubClient, githubRequest } = require("../utils/graphql-client");
const { fetchProjectFields } = require("./field-service");
const { info, warn, error, formatError } = require("../utils/logger");

function readEventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    throw new Error("Unable to locate GitHub event payload (GITHUB_EVENT_PATH).");
  }

  const raw = fs.readFileSync(eventPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse GitHub event payload: ${err.message}`);
  }
}

async function resolveProject(client, ownerLogin, projectNumber) {
  const query = `
    query ($login: String!, $number: Int!) {
      user(login: $login) {
        project: projectV2(number: $number) { id title }
      }
      organization(login: $login) {
        project: projectV2(number: $number) { id title }
      }
    }
  `;

  const res = await githubRequest(client, query, { login: ownerLogin, number: projectNumber });
  const project = res.user?.project || res.organization?.project;
  if (!project) {
    return null;
  }

  const ownerType = res.user?.project ? "user" : "organization";
  info(`Resolved project '${project.title}' (#${projectNumber}) under ${ownerType} '${ownerLogin}'.`);
  return project;
}

async function findProjectItemForIssue(client, projectId, issueNodeId) {
  const query = `
    query ($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 50, after: $after) {
            nodes {
              id
              content {
                __typename
                ... on Issue { id }
                ... on PullRequest { id }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  `;

  let after = null;
  while (true) {
    const res = await githubRequest(client, query, { projectId, after });
    const connection = res.node?.items;
    if (!connection) {
      return null;
    }

    for (const node of connection.nodes || []) {
      const content = node.content;
      if (content && content.id === issueNodeId) {
        return node;
      }
    }

    if (!connection.pageInfo?.hasNextPage) {
      return null;
    }
    after = connection.pageInfo.endCursor;
  }
}

async function addProjectItem(client, projectId, issueNodeId) {
  const mutation = `
    mutation ($input: AddProjectV2ItemByIdInput!) {
      addProjectV2ItemById(input: $input) {
        item { id }
      }
    }
  `;

  const res = await githubRequest(client, mutation, {
    input: { projectId, contentId: issueNodeId },
  });
  return res.addProjectV2ItemById?.item || null;
}

async function ensureProjectItem(client, projectId, issueNodeId) {
  const existing = await findProjectItemForIssue(client, projectId, issueNodeId);
  if (existing) {
    return existing;
  }

  try {
    const created = await addProjectItem(client, projectId, issueNodeId);
    if (created && created.id) {
      info(`Added issue to project (item id ${created.id}).`);
      return created;
    }
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    if (message.toLowerCase().includes("already")) {
      warn("Issue already present in project; re-fetching item id.");
      return findProjectItemForIssue(client, projectId, issueNodeId);
    }
    throw err;
  }

  warn("Issue was added to project but item id was not returned; re-fetching.");
  return findProjectItemForIssue(client, projectId, issueNodeId);
}

async function resolveStatusField(client, projectId, fieldName, optionName) {
  const fields = await fetchProjectFields(client, projectId);
  const statusField = fields.find((field) => field.name?.toLowerCase() === fieldName.toLowerCase());
  if (!statusField) {
    throw new Error(`Project is missing required field '${fieldName}'.`);
  }
  if (statusField.dataType !== "SINGLE_SELECT") {
    throw new Error(`Field '${fieldName}' is not a single select field.`);
  }

  const option = (statusField.options || []).find(
    (opt) => opt.name?.toLowerCase() === optionName.toLowerCase()
  );
  if (!option) {
    throw new Error(`Field '${fieldName}' is missing option '${optionName}'.`);
  }

  return { field: statusField, option };
}

async function updateSingleSelectField(client, projectId, itemId, fieldId, optionId) {
  const mutation = `
    mutation ($input: UpdateProjectV2ItemFieldValueInput!) {
      updateProjectV2ItemFieldValue(input: $input) {
        projectV2Item { id }
      }
    }
  `;

  await githubRequest(client, mutation, {
    input: {
      projectId,
      itemId,
      fieldId,
      value: { singleSelectOptionId: optionId },
    },
  });
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required.");
  }

  const payload = readEventPayload();
  const issue = payload.issue;
  if (!issue) {
    info("Event does not include an issue; skipping.");
    return;
  }

  const milestone = issue.milestone?.title || "";
  const targetMilestone = (process.env.MILESTONE_NAME || "Backlog").trim();
  if (!milestone) {
    info("Issue has no milestone; nothing to do.");
    return;
  }

  if (milestone.toLowerCase() !== targetMilestone.toLowerCase()) {
    info(
      `Issue milestone '${milestone}' does not match target '${targetMilestone}'; skipping.`
    );
    return;
  }

  const issueNodeId = issue.node_id;
  if (!issueNodeId) {
    throw new Error("Issue payload does not include node_id; cannot continue.");
  }

  const projectOwner = (process.env.PROJECT_OWNER || process.env.GITHUB_REPOSITORY_OWNER || "").trim();
  if (!projectOwner) {
    throw new Error("PROJECT_OWNER (or GITHUB_REPOSITORY_OWNER) must be provided.");
  }

  const projectNumber = parseInt(process.env.PROJECT_NUMBER || "", 10);
  if (Number.isNaN(projectNumber)) {
    throw new Error("PROJECT_NUMBER must be set to the target project number.");
  }

  const statusFieldName = (process.env.STATUS_FIELD_NAME || "Status").trim();
  const statusOptionName = (process.env.STATUS_OPTION_NAME || "Backlog").trim();

  const client = createGitHubClient(token);
  const project = await resolveProject(client, projectOwner, projectNumber);
  if (!project) {
    throw new Error(`Project ${projectOwner}#${projectNumber} was not found.`);
  }

  const projectItem = await ensureProjectItem(client, project.id, issueNodeId);
  if (!projectItem || !projectItem.id) {
    throw new Error("Failed to determine project item id for issue.");
  }

  const { field, option } = await resolveStatusField(
    client,
    project.id,
    statusFieldName,
    statusOptionName
  );

  await updateSingleSelectField(client, project.id, projectItem.id, field.id, option.id);
  info(
    `Set project item '${projectItem.id}' status to '${option.name}' for issue #${issue.number}.`
  );
}

main().catch((err) => {
  error(formatError(err));
  process.exit(1);
});
