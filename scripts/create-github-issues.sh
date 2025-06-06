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

DIR="generated-issues"
for file in "$DIR"/issue*.md; do
  if [[ -f "$file" ]]; then
    title=$(head -n 1 "$file" | sed 's/^# //')
    body=$(tail -n +2 "$file")
    echo "Creating issue: $title"
    echo "$body" | gh issue create -R "$REPO" -t "$title" -F -
  fi
done
