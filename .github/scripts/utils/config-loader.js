const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { warn, info, debug } = require("./logger");

const DEFAULT_PROJECTS_DIR = path.join(process.cwd(), ".github", "projects");

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
}

function loadProjectConfigs(projectDir = DEFAULT_PROJECTS_DIR, fallbackOwner = "") {
  if (!fs.existsSync(projectDir)) {
    info(`No project directory found at ${projectDir}, nothing to do.`);
    return [];
  }

  info(`Loading project configs from ${projectDir}`);
  const files = fs
    .readdirSync(projectDir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  debug(`Found candidate config files: ${files.join(", ") || "none"}`);
  const configs = [];

  for (const file of files) {
    const fullPath = path.join(projectDir, file);
    let rawDoc;
    try {
      rawDoc = fs.readFileSync(fullPath, "utf8");
    } catch (err) {
      warn(`Skipping ${file}: unable to read file (${err.message || err}).`);
      continue;
    }

    let parsed;
    try {
      parsed = yaml.load(rawDoc);
    } catch (err) {
      warn(`Skipping ${file}: could not parse YAML (${err.message || err}).`);
      continue;
    }

    if (!parsed || typeof parsed !== "object") {
      warn(`Skipping ${file}: no usable YAML content found.`);
      continue;
    }

    const project = parsed.project || parsed;
    if (!project || typeof project !== "object") {
      warn(`Skipping ${file}: no 'project' key found.`);
      continue;
    }

    const name = project.name;
    if (!name) {
      warn(`Skipping ${file}: project.name is required.`);
      continue;
    }

    const owner = project.owner || fallbackOwner;
    if (!owner) {
      warn(`Skipping ${file}: owner missing and no fallback provided.`);
      continue;
    }

    const description = project.description || "";
    const isPublic = project.public === true;

    const fields = normalizeArray(parsed.fields);
    const views = normalizeArray(parsed.views);
    const automation = normalizeArray(parsed.automation);

    const compiled = {
      sourceFile: file,
      owner,
      name,
      description,
      public: isPublic,
      rawConfig: parsed,
      fields,
      views,
      automation,
    };

    debug(`Loaded project config '${name}' from ${file}`);
    configs.push(compiled);
  }

  info(`Loaded ${configs.length} project config(s).`);
  return configs;
}

module.exports = {
  loadProjectConfigs,
};
