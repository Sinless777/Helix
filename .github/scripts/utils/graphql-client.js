const { graphql } = require("@octokit/graphql");
const { formatError } = require("./logger");

function createGitHubClient(token) {
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set. Aborting.");
  }

  return graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
}

async function githubRequest(client, query, variables) {
  try {
    return await client(query, variables);
  } catch (err) {
    throw new Error(`GitHub GraphQL request failed: ${formatError(err)}`);
  }
}

module.exports = {
  createGitHubClient,
  githubRequest,
};
