const fs = require('fs');
const path = require('path');
const { parse } = require('yaml');
const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  const { owner, repo } = github.context.repo;
  const filePath = path.join(process.cwd(), '.github', 'milestones.yaml');

  if (!fs.existsSync(filePath)) {
    core.setFailed('milestones.yaml not found.');
    return;
  }

  const yamlData = fs.readFileSync(filePath, 'utf8');
  let milestones;
  try {
    milestones = parse(yamlData);
  } catch (err) {
    core.setFailed(`Failed to parse YAML: ${err.message}`);
    return;
  }

  if (!Array.isArray(milestones)) {
    core.setFailed('milestones.yaml must contain an array.');
    return;
  }

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  const existing = await octokit.paginate(octokit.rest.issues.listMilestones, {
    owner,
    repo,
    state: 'all',
    per_page: 100
  });

  const mapByTitle = new Map(existing.map(m => [m.title, m]));
  const titlesInYaml = new Set();

  for (const m of milestones) {
    const title = String(m.title || '').trim();
    if (!title) continue;
    titlesInYaml.add(title);

    const description = m.description || '';
    const state = (m.state || 'open').toLowerCase() === 'closed' ? 'closed' : 'open';
    const due_on = m.due_on ? new Date(m.due_on).toISOString() : undefined;

    const current = mapByTitle.get(title);
    if (current) {
      const needsUpdate = (
        current.state !== state ||
        (due_on && current.due_on !== due_on) ||
        (description && (current.description || '') !== description)
      );
      if (needsUpdate) {
        await octokit.rest.issues.updateMilestone({
          owner,
          repo,
          milestone_number: current.number,
          state,
          description,
          ...(due_on && { due_on })
        });
      }
    } else {
      await octokit.rest.issues.createMilestone({
        owner,
        repo,
        title,
        state,
        description,
        ...(due_on && { due_on })
      });
    }
  }

  // Close any milestones not in YAML
  for (const m of existing) {
    if (!titlesInYaml.has(m.title) && m.state !== 'closed') {
      await octokit.rest.issues.updateMilestone({
        owner,
        repo,
        milestone_number: m.number,
        state: 'closed'
      });
    }
  }
}

main().catch(err => {
  core.setFailed(err.message);
});
