const fs = require('fs');
const path = require('path');
const { parse } = require('yaml');
const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  const { owner, repo } = github.context.repo;
  const actor = github.context.actor;
  const eventPayload = github.context.payload;

  // Determine if this is a PR or an Issue
  let isPR = false;
  let number;

  if (eventPayload.pull_request && eventPayload.pull_request.number) {
    isPR = true;
    number = eventPayload.pull_request.number;
  } else if (eventPayload.issue && eventPayload.issue.number) {
    isPR = false;
    number = eventPayload.issue.number;
  } else {
    core.setFailed('Could not find issue or pull_request number in the event payload.');
    return;
  }

  const cfgPath = process.env.CONFIG_FILE;
  let cfg = {};
  if (cfgPath && fs.existsSync(cfgPath)) {
    try {
      cfg = parse(fs.readFileSync(cfgPath, 'utf8'));
    } catch (error) {
      core.setFailed(`Failed to parse ${cfgPath}: ${error}`);
      return;
    }
  } else {
    core.warning(`Config file not found: ${cfgPath}`);
  }

  const rules = cfg.rules || {};
  const fallback = cfg.default || { assignees: [], reviewers: [] };

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  // Fetch the issue or PR data
  let data;
  if (isPR) {
    const res = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: number
    });
    data = res.data;
  } else {
    const res = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: number
    });
    data = res.data;
  }

  const title = data.title || '';
  const existingLabels = new Set((data.labels || []).map(l => (typeof l === 'string' ? l : l.name)));

  // Determine key for rule lookup
  let key = null;
  for (const lbl of existingLabels) {
    if (rules[lbl]) {
      key = lbl;
      break;
    }
  }
  if (!key) {
    if (actor === 'renovate[bot]') key = 'renovate';
    else if (actor === 'dependabot[bot]') key = 'dependabot';
    else if (actor === 'github-actions[bot]') key = 'ci';
  }
  if (!key) {
    const t = title.toLowerCase();
    if (/\bbug|\bfix|\bregression/.test(t)) key = 'type:bug';
    else if (/\bfeature|\benhancement|\bfeat/.test(t)) key = 'type:feature';
    else if (/\bchore|\brefactor|\bcleanup/.test(t)) key = 'type:chore';
    else if (/\bsecurity|\bcve|\bvuln/.test(t)) key = 'type:security';
    else if (/\bdocs?/.test(t)) key = 'type:docs';
  }

  const rule = (key && rules[key]) ? rules[key] : fallback;

  const labelsToAdd = [];
  if (key && key.includes(':') && !existingLabels.has(key)) {
    labelsToAdd.push(key);
  }

  const assignees = Array.from(new Set([
    ...(rule.assignees || []),
    ...(fallback.assignees || [])
  ])).filter(Boolean);
  const reviewers = isPR
    ? Array.from(new Set([
        ...(rule.reviewers || []),
        ...(fallback.reviewers || [])
      ])).filter(Boolean)
    : [];

  if (!assignees.includes('Sinless777')) {
    assignees.unshift('Sinless777');
  }

  if (labelsToAdd.length) {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: number,
      labels: labelsToAdd
    });
    core.info(`Added label(s): ${labelsToAdd.join(', ')}`);
  }

  if (assignees.length) {
    try {
      await octokit.rest.issues.addAssignees({
        owner,
        repo,
        issue_number: number,
        assignees
      });
      core.info(`Assigned: ${assignees.join(', ')}`);
    } catch (e) {
      core.warning(`Failed to assign: ${e.message}`);
    }
  }

  if (isPR && reviewers.length) {
    try {
      await octokit.rest.pulls.requestReviewers({
        owner,
        repo,
        pull_number: number,
        reviewers: reviewers.filter(u => !u.endsWith('[bot]'))
      });
      core.info(`Requested reviewers: ${reviewers.join(', ')}`);
    } catch (e) {
      core.warning(`Failed to request reviewers: ${e.message}`);
    }
  }

  // Milestone logic
  const openMilestones = await octokit.paginate(octokit.rest.issues.listMilestones, {
    owner,
    repo,
    state: 'open',
    per_page: 100
  });
  const norm = s => s.toLowerCase().replace(/[\s\p{Emoji}—–-]/gu, '');
  const findMilestone = search => openMilestones.find(m => norm(m.title).includes(norm(search)));

  let selectedMilestone = null;
  const versionMatch = title.match(/\bv?(\d+\.\d+\.\d+)\b/);
  if (versionMatch) {
    selectedMilestone = findMilestone(versionMatch[1]);
  }
  if (!selectedMilestone && key === 'type:security') {
    selectedMilestone = findMilestone('security');
  }
  if (!selectedMilestone && actor === 'renovate[bot]') {
    selectedMilestone = findMilestone('renovate');
  }
  if (!selectedMilestone) {
    selectedMilestone = findMilestone('backlog');
  }

  if (selectedMilestone && data.milestone?.number !== selectedMilestone.number) {
    try {
      await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: number,
        milestone: selectedMilestone.number
      });
      core.info(`Milestone set to: ${selectedMilestone.title}`);
    } catch (e) {
      core.warning(`Failed to set milestone: ${e.message}`);
    }
  } else {
    core.info('Milestone unchanged.');
  }

  core.info('✅ Auto-assignment complete.');
}

main().catch(err => {
  core.setFailed(err.message);
});
