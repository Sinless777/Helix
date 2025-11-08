// .github/scripts/releasenotes.js
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runCommand(cmd) {
  const { stdout, stderr } = await exec(cmd);
  if (stderr) {
    console.warn(`Warning: command "${cmd}" produced stderr:`, stderr);
  }
  return stdout.trim();
}

async function main() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('ERROR: OPENAI_API_KEY not set');
    process.exit(1);
  }

  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: openaiKey });

  // Determine latest tag
  const lastTag = await runCommand('git describe --tags --abbrev=0');
  console.log('Last tag:', lastTag);

  // Get all commits since that tag
  const commitRange = `${lastTag}..HEAD`;
  const rawCommits = await runCommand(`git log ${commitRange} --pretty=format:"%h %s"`);
  if (!rawCommits) {
    console.log('No new commits; skipping release-notes generation');
    return;
  }
  console.log('Commits since last tag:\n', rawCommits);

  // Build prompt for OpenAI
  const prompt = `
You are a professional release notes writer.
Generate clear, user-facing release notes for the upcoming release (since tag ${lastTag}).
Here are the commit entries (one per line):
${rawCommits}

Guidelines:
- Group changes into categories: Features, Improvements, Bug Fixes, etc.
- Use bullet points, emojis, and speak in plain language with users (not dev-only).
- Do NOT list every commit; just top key changes.
- Be concise and compelling.

Release Notes:
`;

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You generate release notes from commit messages.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 500
  });

  const notes = response.choices[0].message.content.trim();
  console.log('Generated release notes:\n', notes);

  // Write to file
  const fileName = `RELEASE_NOTES_${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(fileName, `# Release notes (since ${lastTag})\n\n${notes}\n`);
  console.log(`📝 Wrote release notes to ${fileName}`);
}

main().catch(err => {
  console.error('Failed to generate release notes:', err);
  process.exit(1);
});
