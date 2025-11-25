const { githubRequest } = require("../utils/graphql-client");
const { info, warn, debug } = require("../utils/logger");

async function resolveOwner(client, login) {
  const query = `
    query ($login: String!) {
      organization(login: $login) { id login __typename }
      user(login: $login) { id login __typename }
    }
  `;

  const res = await githubRequest(client, query, { login });
  if (res.organization) {
    return { id: res.organization.id, type: "organization", login: res.organization.login };
  }
  if (res.user) {
    return { id: res.user.id, type: "user", login: res.user.login };
  }
  return null;
}

async function getRepository(client, repoFullName) {
  const [owner, name] = repoFullName.split("/");
  if (!owner || !name) {
    throw new Error(`Invalid repository name: ${repoFullName}`);
  }

  const query = `
    query ($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
        nameWithOwner
        url
      }
    }
  `;

  const res = await githubRequest(client, query, { owner, name });
  if (!res.repository) {
    throw new Error(`Repository ${repoFullName} not found.`);
  }
  return res.repository;
}

async function findProjectByName(client, ownerType, ownerLogin, projectName) {
  const query = `
    query ($login: String!, $after: String, $search: String!) {
      ${ownerType}(login: $login) {
        projectsV2(first: 20, after: $after, query: $search, orderBy: {field: NUMBER, direction: DESC}) {
          nodes {
            id
            number
            title
            shortDescription
            public
            url
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  let after = null;
  while (true) {
    const res = await githubRequest(client, query, { login: ownerLogin, after, search: projectName });
    const container = res[ownerType];
    if (!container || !container.projectsV2) {
      break;
    }

    for (const node of container.projectsV2.nodes || []) {
      if (node.title && node.title.toLowerCase() === projectName.toLowerCase()) {
        return node;
      }
    }

    if (!container.projectsV2.pageInfo?.hasNextPage) break;
    after = container.projectsV2.pageInfo.endCursor;
  }

  return null;
}

async function createProject(client, ownerId, title, repositoryId) {
  const mutation = `
    mutation ($input: CreateProjectV2Input!) {
      createProjectV2(input: $input) {
        projectV2 {
          id
          number
          title
          shortDescription
          public
          url
        }
      }
    }
  `;

  const input = { ownerId, title };
  if (repositoryId) input.repositoryId = repositoryId;

  const res = await githubRequest(client, mutation, { input });
  return res.createProjectV2.projectV2;
}

async function updateProject(client, projectId, updates) {
  const mutation = `
    mutation ($input: UpdateProjectV2Input!) {
      updateProjectV2(input: $input) {
        projectV2 {
          id
          title
          shortDescription
          public
          url
        }
      }
    }
  `;

  const input = { projectId, ...updates };
  const res = await githubRequest(client, mutation, { input });
  return res.updateProjectV2.projectV2;
}

async function fetchLinkedRepositories(client, projectId) {
  const query = `
    query ($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          repositories(first: 50, after: $after) {
            nodes { id nameWithOwner }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;

  const repos = [];
  let after = null;
  while (true) {
    const res = await githubRequest(client, query, { projectId, after });
    const repoConn = res.node?.repositories;
    if (!repoConn) break;
    repos.push(...(repoConn.nodes || []));
    if (!repoConn.pageInfo?.hasNextPage) break;
    after = repoConn.pageInfo.endCursor;
  }
  return repos;
}

async function linkProjectToRepository(client, projectId, repository) {
  const existing = await fetchLinkedRepositories(client, projectId);
  const alreadyLinked = existing.some((r) => r.id === repository.id);
  if (alreadyLinked) {
    debug(`Project already linked to ${repository.nameWithOwner}`);
    return;
  }

  const mutation = `
    mutation ($input: LinkProjectV2ToRepositoryInput!) {
      linkProjectV2ToRepository(input: $input) {
        projectV2 { id }
      }
    }
  `;

  await githubRequest(client, mutation, {
    input: {
      projectId,
      repositoryId: repository.id,
    },
  });
  info(`Linked project to repository ${repository.nameWithOwner}`);
}

async function ensureProject(client, config, repository) {
  const owner = await resolveOwner(client, config.owner);
  if (!owner) {
    throw new Error(`Owner '${config.owner}' not found or not accessible with provided token.`);
  }

  let project = await findProjectByName(client, owner.type, owner.login, config.name);
  if (!project) {
    info(`Creating project '${config.name}' for ${owner.type} ${owner.login}`);
    project = await createProject(client, owner.id, config.name, repository?.id);
  } else {
    info(`Found existing project '${config.name}' (#${project.number})`);
  }

  const desiredPublic = !!config.public;
  const updates = {};
  if (project.title !== config.name) updates.title = config.name;
  if ((project.shortDescription || "") !== (config.description || "")) {
    updates.shortDescription = config.description || "";
  }
  if (typeof project.public === "boolean" && project.public !== desiredPublic) {
    updates.public = desiredPublic;
  }

  if (Object.keys(updates).length) {
    project = await updateProject(client, project.id, updates);
    info(`Updated project settings for '${config.name}'`);
  }

  if (repository) {
    await linkProjectToRepository(client, project.id, repository);
  }

  return { ...project, owner };
}

module.exports = {
  ensureProject,
  getRepository,
};
