#!/usr/bin/env node

/**
 * Nx v22 computes whether plugins run in isolation at module load time.
 * In sandboxes where Unix domain sockets are blocked (e.g. this repo),
 * the plugin worker can never start, so we rewrite the helper to evaluate
 * the env flag at call time instead. This allows setting NX_ISOLATE_PLUGINS
 * via .local.env (after Nx loads dotenv) without touching node_modules by hand.
 */
const { readFileSync, writeFileSync } = require('node:fs');

function patchNxGetPlugins() {
  let targetPath;
  try {
    targetPath = require.resolve('nx/src/project-graph/plugins/get-plugins.js');
  } catch (err) {
    console.warn('[nx patch] Unable to resolve Nx get-plugins file.', err?.message ?? err);
    return;
  }

  const contents = readFileSync(targetPath, 'utf8');
  const alreadyPatched = contents.includes(
    'const loadingMethod = (...args) => ((0, enabled_1.isIsolationEnabled)()'
  );
  if (alreadyPatched) {
    return;
  }

  const needle =
    "const loadingMethod = (0, enabled_1.isIsolationEnabled)()\n" +
    '    ? isolation_1.loadNxPluginInIsolation\n' +
    '    : in_process_loader_1.loadNxPlugin;';

  if (!contents.includes(needle)) {
    throw new Error('[nx patch] Unable to find loadingMethod definition to patch.');
  }

  const replacement =
    "const loadingMethod = (...args) => ((0, enabled_1.isIsolationEnabled)()\n" +
    '    ? isolation_1.loadNxPluginInIsolation\n' +
    '    : in_process_loader_1.loadNxPlugin)(...args);';

  const updated = contents.replace(needle, replacement);
  writeFileSync(targetPath, updated, 'utf8');
  console.info('[nx patch] Rewrote loadingMethod to evaluate isolation mode at call time.');
}

function patchNxBinDefaults() {
  let nxBinPath;
  try {
    nxBinPath = require.resolve('nx/bin/nx.js');
  } catch (err) {
    console.warn('[nx patch] Unable to resolve nx/bin/nx.js', err?.message ?? err);
    return;
  }

  const contents = readFileSync(nxBinPath, 'utf8');
  const snippet = "process.env.NX_ISOLATE_PLUGINS ??= 'false';";
  if (contents.includes(snippet)) {
    return;
  }

  const insertion =
    "process.env.NX_ISOLATE_PLUGINS ??= 'false';\n" +
    "process.env.NX_DAEMON ??= 'false';\n";

  const marker = "Object.defineProperty(exports, \"__esModule\", { value: true });";
  const idx = contents.indexOf(marker);
  if (idx === -1) {
    throw new Error('[nx patch] Did not find insertion marker in nx/bin/nx.js');
  }

  const prefix = contents.slice(0, idx + marker.length) + '\n' + insertion;
  const updated = prefix + contents.slice(idx + marker.length + 1);
  writeFileSync(nxBinPath, updated, 'utf8');
  console.info('[nx patch] Forced NX_ISOLATE_PLUGINS and NX_DAEMON defaults to false.');
}

patchNxGetPlugins();
patchNxBinDefaults();
