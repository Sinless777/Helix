const prefix = "[project-sync]";
const DEBUG = String(process.env.DEBUG_PROJECT_SYNC || "").toLowerCase() === "true";

function info(message) {
  console.log(`${prefix} ${message}`);
}

function warn(message) {
  console.warn(`${prefix} WARN: ${message}`);
}

function error(message) {
  console.error(`${prefix} ERROR: ${message}`);
}

function debug(message) {
  if (DEBUG) {
    console.log(`${prefix} DEBUG: ${message}`);
  }
}

function formatError(err) {
  if (!err) return "unknown error";
  if (typeof err === "string") return err;
  const base = err.message || String(err);
  if (Array.isArray(err.errors) && err.errors.length) {
    const details = err.errors.map((e) => e.message || JSON.stringify(e)).join("; ");
    return `${base} (${details})`;
  }
  return base;
}

module.exports = {
  info,
  warn,
  error,
  debug,
  formatError,
};
