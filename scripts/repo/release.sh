#!/usr/bin/env bash
# Exit immediately on error, treat unset variables as errors, and propagate errors in pipelines
set -o errexit -o nounset -o pipefail

# Load logging functions (log_info, log_warn, log_fatal, log_success)
source "$(dirname "$0")/../utils/logger.sh"  

# --------------------------------------------------
# Parse arguments for --clean-release
# --------------------------------------------------
CLEAN_RELEASE=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --clean-release) CLEAN_RELEASE=true ;;
    *) ;;  # ignore
  esac
  shift
done

# --------------------------------------------------
# clean_release: remove tags/releases
# --------------------------------------------------
clean_release() {
  log_warning "--clean-release enabled: purging tags and history"
  git fetch --prune origin "+refs/tags/*:refs/tags/*"
  for tag in $(git tag -l); do
    log_warning "Deleting local tag: $tag"
    git tag -d "$tag"
  done
  for remote in $(git remote); do
    log_info "Pruning remote refs for $remote"
    git remote prune "$remote"
    for tag in $(git ls-remote --tags "$remote" | awk '{print \$2}' | sed 's#refs/tags/##'); do
      log_warning "Deleting remote tag $tag on $remote"
      git push "$remote" --delete "$tag" || git push "$remote" :"refs/tags/$tag"
    done
  done
  if command -v gh >/dev/null 2>&1; then
    for rel in $(gh release list --limit 100 --json tagName --jq '.[].tagName'); do
      log_warning "Deleting release: $rel"
      gh release delete "$rel" --yes
    done
  else
    log_error "GitHub CLI not found; skipping release deletions"
    exit 1
  fi
  git reflog expire --expire=now --all
  git prune --expire now
  git gc --aggressive --prune=now
  if [[ -n "$(git tag -l)" ]]; then
    log_error "Tags remain after cleanup: $(git tag -l)"
    exit 1
  fi
  log_success "All tag traces removed"
  exit 0
}
[[ "$CLEAN_RELEASE" == true ]] && clean_release

#----------------------------------------
# Ensure required tools are installed (install them if missing)
#----------------------------------------
check_prereqs() {
  log_info "Checking required tools..."

  for cmd in git jq curl gh npm pnpm 7z git-cliff; do
    if ! command -v "$cmd" &>/dev/null; then
      log_warn "$cmd is missing. Installing..."
      case "$cmd" in
        7z)
          sudo apt-get update && sudo apt-get install -y p7zip-full || log_fatal "Failed to install 7z"
          ;;
        git)
          sudo apt-get update && sudo apt-get install -y git || log_fatal "Failed to install git"
          ;;
        jq)
          sudo apt-get update && sudo apt-get install -y jq || log_fatal "Failed to install jq"
          ;;
        curl)
          sudo apt-get update && sudo apt-get install -y curl || log_fatal "Failed to install curl"
          ;;
        gh)
          sudo apt-get update && sudo apt-get install -y gh || log_fatal "Failed to install gh"
          ;;
        npm)
          sudo apt-get update && sudo apt-get install -y npm || log_fatal "Failed to install npm"
          ;;
        pnpm)
          if command -v npm &>/dev/null; then
            log_info "Installing pnpm via npm..."
            npm install -g pnpm || log_fatal "Failed to install pnpm via npm"
          else
            log_fatal "pnpm is required but npm is not installed"
          fi
          ;;
        git-cliff)
          CLIFF_VERSION="1.4.0"
          CLIFF_URL="https://github.com/orhun/git-cliff/releases/download/v${CLIFF_VERSION}/git-cliff-${CLIFF_VERSION}-x86_64-unknown-linux-musl.tar.gz"
          CLIFF_TMP="/tmp/git-cliff.tar.gz"
          curl -sSL "$CLIFF_URL" -o "$CLIFF_TMP" || log_fatal "Failed to download git-cliff"
          mkdir -p /tmp/git-cliff-bin && tar -xf "$CLIFF_TMP" -C /tmp/git-cliff-bin || log_fatal "Failed to unpack git-cliff archive"
          sudo mv /tmp/git-cliff-bin/git-cliff /usr/local/bin/ || log_fatal "Failed to install git-cliff binary"
          rm -rf /tmp/git-cliff*
          ;;
        *)
          log_fatal "Missing required command: $cmd and no auto-installer defined"
          ;;
      esac
    fi
  done

  log_info "All prerequisites satisfied."
}

#----------------------------------------
# Determine version bump type using OpenAI
#----------------------------------------
determine_bump() {
  log_info "Determining version bump (patch or minor)…"
  # Identify latest tag or default to v0.0.0
  LAST_TAG=$(git describe --tags --abbrev=0 || echo "v0.0.0")
  # Collect commit messages since last tag
  COMMITS=$(git log "$LAST_TAG"..HEAD --pretty=format:'- %s')
  log_info "Commits since $LAST_TAG:"
  echo "$COMMITS"

  # Construct OpenAI prompt
  read -r -d '' PROMPT <<EOF
You are a semantic versioning assistant. Based on the following commit messages, determine whether the next version bump should be 'patch' or 'minor'.
Commit messages:
$COMMITS
Respond with exactly one word: patch or minor.
EOF

  # Call OpenAI Chat API using provided API key
  RESPONSE=$(curl -sS https://api.openai.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "model": "gpt-3.5-turbo",
      "messages": [
        {"role": "system", "content": "You decide version bumps."},
        {"role": "user", "content": '"${PROMPT}"'}
      ],
      "temperature": 0
    }') || log_fatal "OpenAI API call failed"

  # Extract and normalize response
  BUMP_TYPE=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' | tr -d '\r' | awk '{print tolower($1)}')
  if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" ]]; then
    log_warn "Unexpected response: $BUMP_TYPE. Defaulting to 'patch'."
    BUMP_TYPE="patch"
  fi
  log_info "Selected bump type: $BUMP_TYPE"
}

#----------------------------------------
# Extract current version from package.json
#----------------------------------------
extract_version() {
  version="$(jq -r '.version' package.json)"
  [[ -n "$version" ]] || log_fatal "Could not parse version from package.json"
  TAG="v$version"
  log_info "Current version: $TAG"
}

#----------------------------------------
# Bump package.json version (patch or minor)
#----------------------------------------
bump_version() {
  determine_bump       # Decide bump type
  log_info "Bumping version: $BUMP_TYPE"
  # Bump version without creating a Git tag
  npm version "$BUMP_TYPE" --no-git-tag-version || log_fatal "Version bump failed"
  # Refresh version and tag
  version="$(jq -r '.version' package.json)"
  TAG="v$version"
  log_info "New version: $TAG"
}

#----------------------------------------
# Validate commit messages
#----------------------------------------
validate_commits() {
  log_info "Validating last 20 commits…"
  npx commitlint --from HEAD~20 --to HEAD || log_fatal "Commitlint errors detected"
}

#----------------------------------------
# Generate changelog file using git-cliff
#----------------------------------------
# generate_changelog() {
#   FILENAME="CHANGELOGS/${TAG}-$(date +%Y-%m-%d).md"
#   log_info "Generating changelog → $FILENAME"
#   mkdir -p CHANGELOGS
#   git cliff --tag "$LAST_TAG" --to-ref "$TAG" -o "$FILENAME" || log_fatal "git-cliff failed"
# }

#----------------------------------------
# Commit changes and create Git tag
#----------------------------------------
commit_and_tag() {
  log_info "Committing changelog and tagging $TAG…"
  git add CHANGELOGS package.json "$FILENAME"
  if git commit -m "chore(release): $TAG"; then
    log_info "Release commit created"
  else
    log_warn "Nothing to commit for release"
  fi
  git tag "$TAG" -f
  git push origin HEAD --tags || log_fatal "Failed to push tags"
}

#----------------------------------------
# Create source archives (tar.gz and .7z)
#----------------------------------------
create_archives() {
  log_info "Creating archives…"
  ARCHIVE_TAR="release-${TAG}.tar.gz"
  ARCHIVE_ZIP="release-${TAG}.7z"
  git archive --format=tar.gz -o "$ARCHIVE_TAR" "$TAG"
  7z a "$ARCHIVE_ZIP" . -xr!node_modules -xr!.git -xr!.taskfiles || log_fatal "7z archiving failed"
}

#----------------------------------------
# Publish release to GitHub
#----------------------------------------
publish_release() {
  log_info "Publishing GitHub release…"
  gh release create "$TAG" "$FILENAME" "$ARCHIVE_TAR" "$ARCHIVE_ZIP" \
    --title "$TAG" --notes-file "$FILENAME" || log_error "GitHub release creation failed"
}

#----------------------------------------
# Cleanup temporary files
#----------------------------------------
cleanup() {
  log_info "Cleaning up temporary files…"
  rm -f "$ARCHIVE_TAR" "$ARCHIVE_ZIP"
}

#----------------------------------------
# Main entrypoint: orchestrates release steps
#----------------------------------------
main() {
  log_info "Step: check_prereqs"
  check_prereqs
  log_info "Step: extract_version"
  extract_version
  log_info "Step: validate_commits"
  validate_commits
  log_info "Step: bump_version"
  bump_version
  log_info "Step: generate_changelog"
  generate_changelog
  log_info "Step: commit_and_tag"
  commit_and_tag
  log_info "Step: create_archives"
  create_archives
  log_info "Step: publish_release"
  publish_release
  log_info "Step: cleanup"
  cleanup
  log_success "🎉 Released $TAG successfully"
}


main "$@"
