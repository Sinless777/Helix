#!/usr/bin/env bash
set -eo pipefail  # Exit on errors and pipe failures; ignore undefined variables

# --------------------------------------------------
# Configuration
# --------------------------------------------------
VERSION="v1.0.0"                         # Current release version
OUT="CHANGELOGS/${VERSION}-Changelog.md"  # Output changelog path

# Predefine to avoid unbound variable errors
PREV_TAG=$VERSION
TAG_DATE=$(date +%Y-%m-%d)  # Default to today if no previous tag found

# --------------------------------------------------
# Repository URL for commit links
# --------------------------------------------------
REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
API_BASE="https://api.github.com/repos/${REPO_URL#https://github.com/}"

# --------------------------------------------------
# ANSI color and style codes
# --------------------------------------------------
BOLD="\e[1m"
RESET="\e[0m"
BLUE="\e[34m"
RED="\e[31m"
YELLOW="\e[33m"
GREEN="\e[32m"

# --------------------------------------------------
# Logging functions (stderr for separation)
# --------------------------------------------------
log_info()    { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${BLUE}[INFO]${RESET}    $*" >&2; }
log_warning() { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${YELLOW}[WARNING]${RESET} $*" >&2; }
log_error()   { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${RED}[ERROR]${RESET}   $*" >&2; }
log_success(){ echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${GREEN}[SUCCESS]${RESET} $*" >&2; }

# --------------------------------------------------
# get_prev_tag: find last tag before current
# --------------------------------------------------
get_prev_tag() {
  log_info "Retrieving previous tag (excluding $VERSION)"
  git describe --tags --abbrev=0 --match "v[0-9]*" --exclude "$VERSION" 2>/dev/null || echo ""
}

# --------------------------------------------------
# get_tag_date: determine cutoff date
# --------------------------------------------------
get_tag_date() {
  local tag="$1"
  if [[ -n "$tag" ]]; then
    log_info "Fetching date for tag: $tag"
    git log -1 --format=%ad --date=short "$tag"
  else
    echo ""
  fi
}

# --------------------------------------------------
# ensure_output_dir: create target dir
# --------------------------------------------------
ensure_output_dir() {
  log_info "Ensuring changelog directory exists"
  mkdir -p "$(dirname "$OUT")"
}

# --------------------------------------------------
# get_commits_for_release: raw commit list
# --------------------------------------------------
get_commits_for_release() {
  # Output each commit date, a linked hash, and subject
  local opts=(--no-merges --pretty=format:"%ad [\%h](${REPO_URL}/commit/%h) %s" --date=short --reverse)
  [[ -n "$TAG_DATE" ]] && opts+=("--since=${TAG_DATE}")
  git log "${opts[@]}"
}


# --------------------------------------------------
# fetch_and_sort_commits: categorize via regex
# --------------------------------------------------
declare -a FEATURES FIXES DOCS STYLES REFACTORS PERF TESTS BUILDS CIS CHORES REVERTS MERGES UNKNOWNS
fetch_and_sort_commits() {
  log_info "Entering fetch_and_sort_commits; PREV_TAG='$PREV_TAG'"
  FEATURES=(); FIXES=(); DOCS=(); STYLES=(); REFACTORS=(); PERF=(); TESTS=(); BUILDS=(); CIS=(); CHORES=(); REVERTS=(); MERGES=();

  while IFS= read -r line; do
    local date hash subject
    date="${line%% *}"
    hash="${line#* }"; hash="${hash%% *}"
    subject="${line#* }"; subject="${subject#* }"

    if [[ $subject =~ ^feat(:|\(.+\):) ]]; then
      FEATURES+=("$subject ($hash)")
    elif [[ $subject =~ ^fix(:|\(.+\):) ]]; then
      FIXES+=("$subject ($hash)")
    elif [[ $subject =~ ^docs(:|\(.+\):) ]]; then
      DOCS+=("$subject ($hash)")
    elif [[ $subject =~ ^style(:|\(.+\):) ]]; then
      STYLES+=("$subject ($hash)")
    elif [[ $subject =~ ^refactor(:|\(.+\):) ]]; then
      REFACTORS+=("$subject ($hash)")
    elif [[ $subject =~ ^perf(:|\(.+\):) ]]; then
      PERF+=("$subject ($hash)")
    elif [[ $subject =~ ^test(:|\(.+\):) ]]; then
      TESTS+=("$subject ($hash)")
    elif [[ $subject =~ ^build(:|\(.+\):) ]]; then
      BUILDS+=("$subject ($hash)")
    elif [[ $subject =~ ^ci(:|\(.+\):) ]]; then
      CIS+=("$subject ($hash)")
    elif [[ $subject =~ ^chore(:|\(.+\):) ]]; then
      CHORES+=("$subject ($hash)")
    elif [[ $subject =~ ^revert(:|\(.+\):) ]]; then
      REVERTS+=("$subject ($hash)")
    elif [[ $subject =~ ^merge(:|\(.+\):) ]]; then
      MERGES+=("$subject ($hash)")
    else
      CHORES+=("$subject ($hash)")
    fi
  done < <(get_commits_for_release)

  log_info "Completed fetch_and_sort_commits; counts -> FEATURES=${#FEATURES[@]}, FIXES=${#FIXES[@]}, DOCS=${#DOCS[@]}, STYLES=${#STYLES[@]}, REFACTORS=${#REFACTORS[@]}, PERF=${#PERF[@]}, TESTS=${#TESTS[@]}, BUILDS=${#BUILDS[@]}, CIS=${#CIS[@]}, CHORES=${#CHORES[@]}, REVERTS=${#REVERTS[@]}, MERGES=${#MERGES[@]}, UNKNOWNS=${#UNKNOWNS[@]}"
}

# --------------------------------------------------
# Fetch PRs and issues
# --------------------------------------------------
declare -a PULL_REQUESTS ISSUES
fetch_prs(){
  mapfile -t PULL_REQUESTS < <(curl -s "${API_BASE}/pulls?state=closed&per_page=100" \
    | jq -r '.[] | select(.merged_at!=null) | "- [#\(.number)](\(.html_url)) - \(.title)"')
}
fetch_issues(){
  mapfile -t ISSUES < <(curl -s "${API_BASE}/issues?state=closed&per_page=100" \
    | jq -r '.[] | select(.pull_request==null) | "- [#\(.number)](\(.html_url)) - \(.title)"')
    
  log_info "Fetched ${#PULL_REQUESTS[@]} pull requests and ${#ISSUES[@]} issues"  
}

# --------------------------------------------------
# print_array_section: output
# --------------------------------------------------
print_array_section() {
  local label="$1"; shift; local arr=("$@")
  if (( ${#arr[@]} > 0 )); then
    echo "## $label"; echo
    for entry in "${arr[@]}"; do echo "- $entry"; done; echo
  fi
}

# --------------------------------------------------
# write_header: header
# --------------------------------------------------
write_header() {
  echo "# Changelog"; echo
  echo "## [${VERSION}] -- $(date +%Y-%m-%d)"; echo
  if [[ -n "$PREV_TAG" ]]; then
    echo "* Changes since [${PREV_TAG}]($REPO_URL/releases/tag/${PREV_TAG})"; echo
  fi
}


# --------------------------------------------------
# generate_change_summary
# --------------------------------------------------
declare summary
generate_change_summary() {
  log_info "Generating change summary"
  summary=$(call_llm)
  if [[ -z "$summary" ]]; then
    log_warning "LLM call returned empty summary; using default"
    summary="No significant changes detected. Please check the commit history for details. This is a fallback message in case the LLM API is unavailable or returns no data."
  fi
  echo "## Summary\n\n"
  echo "*This changelog summarizes version ${VERSION}, generated on $(date +%Y-%m-%d).*\n"
  echo
  echo "$summary\n"
  echo
}

# --------------------------------------------------
# Call the LLM API
# --------------------------------------------------
call_llm() {
  local prompt="Generate a concise summary of the following changes:\n\n"

  truncate_section() {
    local name="$1"
    shift
    local entries=("$@")
    if [[ ${#entries[@]} -gt 0 ]]; then
      echo "### $name"
      printf '%s\n' "${entries[@]}" | head -n 30
    fi
  }

  # Truncate key sections to ~30 lines each
  prompt+="$(truncate_section "Features" "${FEATURES[@]}")\n"
  prompt+="$(truncate_section "Fixes" "${FIXES[@]}")\n"
  prompt+="$(truncate_section "Refactors" "${REFACTORS[@]}")\n"
  prompt+="$(truncate_section "Docs" "${DOCS[@]}")\n"
  prompt+="$(truncate_section "Tests" "${TESTS[@]}")\n"

  prompt+="\nSummarize the changes above in 5 clear, concise sentences for a general audience.\n"
  prompt+="Avoid jargon. Focus on the most important and impactful changes only.\n" 

  # URL-encode the prompt for safe transmission
  local encoded_prompt
  encoded_prompt=$(printf '%s' "$prompt" | jq -s -R -r @uri)

  # Send request to GPT-J 6B open API (no API key required)
  local api_url="http://api.vicgalle.net:5000/generate?token_max_length=150&temperature=0.7&top_p=0.9&context=$encoded_prompt"
  local response_json

  log_info "Prompt Token Length: $(printf '%s' "$prompt" | wc -w) words"
  log_info "Prompt Length: ${#prompt} characters"

  log_warning "This API is public and may be rate-limited or unavailable at times. If you encounter issues, consider using a different LLM service."
  log_warning "Sending request to LLM API with prompt length: ${#prompt} characters. This may take a few minutes and will timeout after 5 minutes."

  response_json=$(curl -s --max-time 300 -X POST "$api_url")


  if [[ -n "$response_json" ]]; then
    # Extract the generated text from the JSON response
    local summary
    summary=$(printf '%s' "$response_json" | jq -r '.text')
    log_info "Response: $summary"
  else
    log_warning "No response from LLM; using default summary"
  fi
  
}

# --------------------------------------------------
# Main orchestration
# --------------------------------------------------
main() {
  log_info "Starting changelog generation v${VERSION}"
  PREV_TAG=$(get_prev_tag)
  TAG_DATE=$(get_tag_date "$PREV_TAG")
  ensure_output_dir
  fetch_and_sort_commits
  fetch_prs
  fetch_issues

  {
    write_header
    # add the summary after the header
    generate_change_summary
    print_array_section "🚀 Features" "${FEATURES[@]}"
    print_array_section "🐛 Bug Fixes" "${FIXES[@]}"
    print_array_section "📝 Documentation" "${DOCS[@]}"
    print_array_section "🎨 Styles" "${STYLES[@]}"
    print_array_section "⚙️ Refactors" "${REFACTORS[@]}"
    print_array_section "⚡️ Performance Improvements" "${PERF[@]}"
    print_array_section "✅ Tests" "${TESTS[@]}"
    print_array_section "📦 Build System" "${BUILDS[@]}"
    print_array_section "🔧 Continuous Integration" "${CIS[@]}"
    print_array_section "🛠️ Chores" "${CHORES[@]}"
    print_array_section "⏪ Reverts" "${REVERTS[@]}"
    print_array_section "🔀 Merges" "${MERGES[@]}"
    print_array_section "Unknowns" "${UNKNOWNS[@]}"
    print_array_section "Pull Requests" "${PULL_REQUESTS[@]}"
    print_array_section "Issues" "${ISSUES[@]}"
    echo "## Summary\nThis changelog summarizes version ${VERSION}, generated on $(date +%Y-%m-%d).\n"
  } > "$OUT"

  log_success "Changelog written to $OUT"
}

# Execute
main
