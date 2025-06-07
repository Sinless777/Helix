# Repository Issues Summary

This directory contains markdown files describing potential issues detected while scanning the repository. Each file corresponds to a single issue.

- [issue1_discord_bot.md](issue1_discord_bot.md) — Discord bot feature missing
- [issue2_website_dashboard.md](issue2_website_dashboard.md) — Web dashboard feature missing
- [issue3_docs_index.md](issue3_docs_index.md) — Empty docs index
- [issue4_changelogs.md](issue4_changelogs.md) — Empty changelogs in packages
- [issue5_root_scripts.md](issue5_root_scripts.md) — Missing root lint/test scripts

## Converting to GitHub issues

Use `scripts/create-github-issues.sh` with the [GitHub CLI](https://cli.github.com/) to open these files as issues:

```bash
./scripts/create-github-issues.sh <owner/repo>
```

Authentication via `gh auth login` or a token provided in `GH_TOKEN`, `GITHUB_PAT`,
or `GITHUB_PAT_GITHUB_COM` is required.
