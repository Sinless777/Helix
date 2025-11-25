const { info, warn } = require("../utils/logger");

async function syncAutomation(_client, _projectId, automationConfig) {
  if (!automationConfig || !automationConfig.length) {
    info("No automation rules defined in config; skipping automation sync.");
    return;
  }

  const descriptions = automationConfig
    .map((rule) => rule && rule.if)
    .filter(Boolean)
    .slice(0, 5)
    .join(", ");

  warn(
    `Project workflows/automation are not exposed via the GitHub GraphQL API. Requested rules (partial): ${descriptions ||
      "n/a"}. Please configure these rules manually in the UI until the API supports them.`
  );
}

module.exports = {
  syncAutomation,
};
