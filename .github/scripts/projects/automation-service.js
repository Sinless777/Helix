const { info, warn, debug } = require("../utils/logger");

async function syncAutomation(_client, _projectId, automationConfig) {
  if (!automationConfig || !automationConfig.length) {
    info("No automation rules defined in config; skipping automation sync.");
    return;
  }

  debug(`Requested automation rules: ${JSON.stringify(automationConfig, null, 2)}`);

  const descriptions = automationConfig
    .map((rule, idx) => {
      if (!rule) return null;
      const cond = rule.if || `rule#${idx + 1}`;
      const actions = rule.set ? Object.keys(rule.set).join(", ") : "no actions";
      return `${cond} -> ${actions}`;
    })
    .filter(Boolean)
    .slice(0, 5)
    .join("; ");

  warn(
    `Project workflows/automation are not exposed via the GitHub GraphQL API. Requested rules (partial): ${descriptions ||
      "n/a"}. Please configure these rules manually in the UI until the API supports them.`
  );
}

module.exports = {
  syncAutomation,
};
