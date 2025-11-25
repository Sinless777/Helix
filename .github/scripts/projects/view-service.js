const { info, warn } = require("../utils/logger");

async function syncViews(_client, _projectId, viewsConfig) {
  if (!viewsConfig || !viewsConfig.length) {
    info("No views defined in config; skipping view sync.");
    return;
  }

  const names = viewsConfig.map((v) => v && v.name).filter(Boolean);
  warn(
    `View sync is not supported by the GitHub GraphQL API yet. Requested views: ${
      names.length ? names.join(", ") : "n/a"
    }.`
  );
}

module.exports = {
  syncViews,
};
