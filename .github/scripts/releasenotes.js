// .github/scripts/releasenotes.js
const fs = require('fs');
const path = require('path');
const util = require('util');
const { execFile } = require('child_process');
const execFileAsync = util.promisify(execFile);

async function runGit(args, opts = {}) {
  const { stdout, stderr } = await execFileAsync('git', args, { ...opts, encoding: 'utf8' });
  if (stderr && stderr.trim()) {
    console.warn(`[git ${args.join(' ')}] stderr: ${stderr.trim()}`);
  }
  return (stdout || '').trim();
}

// Basic CI safety checks (avoid user-controlled bypass)
function assertCiGuards() {
  const {
    GITHUB_ACTIONS,
    GITHUB_EVENT_NAME,
    GITHUB_REF_NAME,
    GITHUB_REPOSITORY,
    GITHUB_REPOSITORY_OWNER,
  } = process.env;

  // Must be running in GitHub Actions
  if (GITHUB_ACTIONS !== 'true') {
    throw new Error('This script must run inside GitHub Actions.');
  }

  // Reject PR contexts (especially forked PRs where secrets aren’t provided)
  if (GITHUB_EVENT_NAME === 'pull_request' || GITHUB_EVENT_NAME === 'pull_request_target') {
    throw new Error('Release notes generation is disabled for pull_request events.');
  }

  // Default: only allow push/workflow_dispatch on main
  const allowedEvents = new Set(['push', 'workflow_dispatch', 'release']);
  if (!allowedEvents.has(GITHUB_EVENT_NAME || '')) {
    throw new Error(`Event "${GITHUB_EVENT_NAME}" is not allowed for release notes.`);
  }

  // Only main (override with ALLOWED_BRANCHES if you really need more)
  const allowedBranches = (process.env.ALLOWED_BRANCHES || 'main').split(',').map(s => s.trim()).filter(Boolean);
  if (GITHUB_EVENT_NAME !== 'release') {
    if (!allowedBranches.includes(GITHUB_REF_NAME || '')) {
      throw new Error(`Branch "${GITHUB_REF_NAME}" is not allowed for release notes.`);
    }
  }

  if (!GITHUB_REPOSITORY || !GITHUB_REPOSITORY_OWNER) {
    throw new Error('Missing repository context in CI environment.');
  }
}

async function getLastTag() {
  // Prefer the nearest annotated/lightweight tag reachable from HEAD
  try {
    return await runGit(['describe', '--tags', '--abbrev=0']);
  } catch {
    // Fallback: if no tags exist, pretend the range starts at the root
    return '';
  }
}

async function getCommitsSince(tag) {
  if (!tag) {
    // First release: collect all commits
    return await runGit(['log', '--pretty=format:%h %s']);
  }
  return await runGit(['log', `${tag}..HEAD`, '--pretty=format:%h %s']);
}

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  // CI guards first — do not let a user-controlled env toggle access
  assertCiGuards();

  // Only now read OpenAI key; this is not a “permission” check, just configuration presence.
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey.length < 20) {
    throw new Error('OPENAI_API_KEY is not set or too short.');
  }

  // Lazy require after guards
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: openaiKey });

  const lastTag = await getLastTag();
  if (lastTag) console.log('Last tag:', lastTag);
  else console.log('No existing tag detected; generating initial release notes for all commits.');

  const rawCommits = await getCommitsSince(lastTag);
  if (!rawCommits) {
    console.log('No new commits; skipping release-notes generation.');
    return;
  }
  console.log('Commits to summarize:\n', rawCommits);

  const prompt = [
    `You are a professional release notes writer.`,
    `Generate clear, user-facing release notes for the upcoming release${lastTag ? ` (since tag ${lastTag})` : ''}.`,
    `Here are the commit entries (one per line):`,
    rawCommits,
    '',
    'Guidelines:',
    '- Group into: Features, Improvements, Bug Fixes, Docs, Chores.',
    '- Bullet points, plain language; highlight impact.',
    '- Summarize; do not list every commit.',
    '- Keep it concise and compelling.',
    '',
    'Release Notes:',
  ].join('\n');

  // OpenAI: defensive call and shape checks
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // faster & cheaper; adjust as needed
    messages: [
      { role: 'system', content: 'You generate high-quality release notes from commit messages.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 700,
  });

  const notes =
    response &&
    response.choices &&
    response.choices[0] &&
    response.choices[0].message &&
    typeof response.choices[0].message.content === 'string'
      ? response.choices[0].message.content.trim()
      : '';

  if (!notes) {
    throw new Error('OpenAI returned an empty response for release notes.');
  }

  console.log('Generated release notes:\n', notes);

  const safeDate = isoDate();
  const fileName = `RELEASE_NOTES_${safeDate}.md`;
  const outPath = path.join(process.cwd(), fileName);
  const header = `# Release notes${lastTag ? ` (since ${lastTag})` : ''}\n\n`;
  fs.writeFileSync(outPath, header + notes + '\n', { encoding: 'utf8' });

  console.log(`📝 Wrote release notes to ${outPath}`);
}

main().catch(err => {
  console.error('Failed to generate release notes:', err && err.stack ? err.stack : String(err));
  process.exit(1);
});
