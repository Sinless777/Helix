#!/usr/bin/env bash

set -euo pipefail

# Colors
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
CYAN="\033[1;36m"
RESET="\033[0m"

log() {
  echo -e "${CYAN}▶ $1${RESET}"
}

success() {
  echo -e "${GREEN}✔ $1${RESET}"
}

warn() {
  echo -e "${YELLOW}⚠ $1${RESET}"
}

error() {
  echo -e "${RED}✘ $1${RESET}"
  exit 1
}

trap 'error "An unexpected error occurred."' ERR

# Ensure we're inside a Git repo
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  error "Not a Git repository. Aborting."
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Current branch: $CURRENT_BRANCH"

# Sanity check: avoid rebasing develop onto itself
if [[ "$CURRENT_BRANCH" == "develop" ]]; then
  error "You're already on 'develop'. Switch to a feature branch first."
fi

# Save any current changes
log "Stashing current changes..."
STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  git stash push -u -m "pre-rebase-backup"
  STASHED=true
  success "Working directory stashed."
fi

# Start the rebase
log "Rebasing '$CURRENT_BRANCH' onto 'develop' with 'ours' strategy..."
if ! git fetch origin develop; then
  error "Failed to fetch latest develop branch."
fi

if ! git rebase origin/develop --strategy=recursive --strategy-option=ours; then
  warn "Conflicts encountered. Entering automated resolution loop..."
fi

# Rebase conflict resolution loop
while [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; do
  log "Auto-resolving conflicts by keeping 'ours' (develop)..."
  git checkout --ours . || warn "Some files may not have been resolved."
  git add -A

  if git commit --no-edit; then
    success "Conflicted commit resolved and committed."
  fi

  if ! git rebase --continue; then
    warn "Rebase paused or skipped. Manual intervention may be required."
    break
  fi
done

# Restore stash if it existed
if [ "$STASHED" = true ]; then
  log "Restoring stashed changes..."
  git stash pop || warn "Could not automatically apply stash. Please resolve manually."
fi

# Finish
success "Rebase of '$CURRENT_BRANCH' onto 'develop' complete with 'ours' strategy."

exit 0
