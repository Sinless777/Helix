#!/usr/bin/env bash

# Script to create GitHub issues from markdown files in generated-issues/
# Usage: ./scripts/create-github-issues.sh <owner/repo>

set -euo pipefail

REPO=${1:-}
if [[ -z "$REPO" ]]; then
  echo "Usage: $0 <owner/repo>" >&2
  exit 1
fi

if ! command -v gh >/dev/null; then
  echo "GitHub CLI (gh) is required" >&2
  exit 1
fi

# If GH_TOKEN is not set, fall back to common PAT variables
if [[ -z "${GH_TOKEN:-}" ]]; then
  if [[ -n "${GITHUB_PAT:-}" ]]; then
    export GH_TOKEN="$GITHUB_PAT"
  elif [[ -n "${GITHUB_PAT_GITHUB_COM:-}" ]]; then
    export GH_TOKEN="$GITHUB_PAT_GITHUB_COM"
  fi
fi

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "Error: GH_TOKEN is not set. Please provide a GitHub token." >&2
  exit 1
fi
DIR="generated-issues"
if [[ ! -d "$DIR" || -z "$(find "$DIR" -maxdepth 1 -name 'issue*.md' -type f 2>/dev/null)" ]]; then
  echo "Error: Directory '$DIR' does not exist or contains no issue files." >&2
  exit 1
fi
for file in "$DIR"/issue*.md; do
  if [[ -f "$file" ]]; then
    title=$(head -n 1 "$file" | sed 's/^# //')
    body=$(tail -n +2 "$file")
    echo "Creating issue: $title"
    echo "$body" | gh issue create -R "$REPO" -t "$title" -F -
  fi
done
