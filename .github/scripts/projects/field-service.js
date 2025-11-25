const { githubRequest } = require("../utils/graphql-client");
const { info, warn, debug } = require("../utils/logger");

const TYPE_MAP = {
  single_select: { fieldType: "SINGLE_SELECT", createType: "SINGLE_SELECT" },
  text: { fieldType: "TEXT", createType: "TEXT" },
  number: { fieldType: "NUMBER", createType: "NUMBER" },
  date: { fieldType: "DATE", createType: "DATE" },
  iteration: { fieldType: "ITERATION", createType: "ITERATION" },
};

const ALLOWED_COLORS = new Set(["BLUE", "GRAY", "GREEN", "ORANGE", "PINK", "PURPLE", "RED", "YELLOW"]);
const COLOR_SYNONYMS = {
  GREY: "GRAY",
  INDIGO: "PURPLE",
};

function normalizeType(type) {
  if (!type) return null;
  const key = String(type).toLowerCase().replace(/[-\s]/g, "_");
  return TYPE_MAP[key] || null;
}

function normalizeColor(color, fieldName) {
  const raw = String(color || "GRAY").toUpperCase();
  const normalized = COLOR_SYNONYMS[raw] || raw;
  if (ALLOWED_COLORS.has(normalized)) return normalized;
  warn(`Option color '${color}' for field '${fieldName}' is invalid; falling back to GRAY.`);
  return "GRAY";
}

function normalizeOptions(options, fieldName) {
  if (!Array.isArray(options)) return [];
  return options
    .map((opt) => ({
      name: (opt && opt.name ? String(opt.name) : "").trim(),
      color: normalizeColor(opt && opt.color, fieldName || (opt && opt.name) || "field"),
      description: opt && opt.description ? String(opt.description) : "",
    }))
    .filter((opt) => opt.name);
}

function optionsEqual(configOpts, existingOpts) {
  if (configOpts.length !== existingOpts.length) return false;
  const toKey = (opt) => `${opt.name.toLowerCase()}::${String(opt.color || "").toUpperCase()}`;
  const sortedConfig = [...configOpts].sort((a, b) => a.name.localeCompare(b.name));
  const sortedExisting = [...existingOpts].sort((a, b) => a.name.localeCompare(b.name));
  return sortedConfig.every((opt, idx) => toKey(opt) === toKey(sortedExisting[idx]));
}

async function fetchProjectFields(client, projectId) {
  const query = `
    query ($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 50, after: $after, orderBy: {field: POSITION, direction: ASC}) {
            nodes {
              ... on ProjectV2FieldCommon {
                id
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                dataType
                options { id name color }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;

  const fields = [];
  let after = null;
  while (true) {
    const res = await githubRequest(client, query, { projectId, after });
    const conn = res.node?.fields;
    if (!conn) break;
    for (const node of conn.nodes || []) {
      fields.push({
        id: node.id,
        name: node.name,
        dataType: node.dataType,
        options: node.options || [],
      });
    }
    debug(
      `Fetched ${fields.length} field(s) so far (page hasNext=${conn.pageInfo?.hasNextPage})`
    );
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return fields;
}

async function createField(client, projectId, config, typeInfo) {
  const mutation = `
    mutation ($input: CreateProjectV2FieldInput!) {
      createProjectV2Field(input: $input) {
        projectV2Field {
          ... on ProjectV2FieldCommon { id name dataType }
          ... on ProjectV2SingleSelectField { id name dataType options { id name color } }
        }
      }
    }
  `;

  const input = {
    projectId,
    name: config.name,
    dataType: typeInfo.createType,
  };

  if (typeInfo.createType === "SINGLE_SELECT") {
    const normalized = normalizeOptions(config.options, config.name);
    if (!normalized.length) {
      throw new Error(`Field '${config.name}' requires at least one option.`);
    }
    input.singleSelectOptions = normalized;
  }

  const res = await githubRequest(client, mutation, { input });
  return res.createProjectV2Field.projectV2Field;
}

async function updateField(client, fieldId, config, typeInfo) {
  const mutation = `
    mutation ($input: UpdateProjectV2FieldInput!) {
      updateProjectV2Field(input: $input) {
        projectV2Field {
          ... on ProjectV2FieldCommon { id name dataType }
          ... on ProjectV2SingleSelectField { id name dataType options { id name color } }
        }
      }
    }
  `;

  const input = { fieldId };
  if (config.name) input.name = config.name;

  if (typeInfo.createType === "SINGLE_SELECT") {
    const normalized = normalizeOptions(config.options, config.name);
    if (!normalized.length) {
      warn(`Skipping option update for '${config.name}' because no options were provided.`);
    } else {
      input.singleSelectOptions = normalized;
    }
  }

  const hasUpdates = Object.keys(input).length > 1;
  if (!hasUpdates) return null;

  const res = await githubRequest(client, mutation, { input });
  return res.updateProjectV2Field.projectV2Field;
}

async function syncFields(client, projectId, fieldsConfig) {
  if (!fieldsConfig || !fieldsConfig.length) {
    info("No custom fields defined in config; skipping field sync.");
    return;
  }

  const existingFields = await fetchProjectFields(client, projectId);
  info(`Syncing ${fieldsConfig.length} field(s); project currently has ${existingFields.length}.`);

  for (const field of fieldsConfig) {
    const name = (field && field.name ? String(field.name) : "").trim();
    const typeInfo = normalizeType(field && field.type);

    if (!name) {
      warn("Encountered a field without a name; skipping.");
      continue;
    }
    if (!typeInfo) {
      warn(`Field '${name}' uses unsupported type '${field.type}'.`);
      continue;
    }

    const existing = existingFields.find((f) => f.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      info(`Creating field '${name}' (${typeInfo.createType})`);
      try {
        await createField(client, projectId, { ...field, name }, typeInfo);
      } catch (err) {
        warn(`Failed to create field '${name}': ${err.message || err}`);
      }
      continue;
    }

    if (existing.dataType !== typeInfo.fieldType) {
      warn(`Field '${name}' exists with type '${existing.dataType}', expected '${typeInfo.fieldType}'. Skipping update.`);
      continue;
    }

    if (typeInfo.createType === "SINGLE_SELECT") {
      const desiredOptions = normalizeOptions(field.options, name);
      const currentOptions = (existing.options || []).map((opt) => ({
        name: opt.name,
        color: String(opt.color || "").toUpperCase(),
        description: "",
      }));

      if (!desiredOptions.length) {
        warn(`Field '${name}' is SINGLE_SELECT but no options provided; skipping option sync.`);
        continue;
      }

      if (optionsEqual(desiredOptions, currentOptions)) {
        debug(`Field '${name}' options already up to date.`);
      } else {
        info(`Updating options for field '${name}'.`);
        await updateField(client, existing.id, { ...field, name }, typeInfo);
      }
    } else if (existing.name !== name) {
      info(`Renaming field '${existing.name}' to '${name}'.`);
      await updateField(client, existing.id, { ...field, name }, typeInfo);
    } else {
      debug(`Field '${name}' already up to date.`);
    }
  }
}

module.exports = {
  syncFields,
  fetchProjectFields,
};
