#!/usr/bin/env bash

# --------------------------------------------------
# Style codes via tput (portable & dynamic)
# --------------------------------------------------
BOLD=$(tput bold)
RESET=$(tput sgr0)
BLUE=$(tput setaf 4)
RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)
GREEN=$(tput setaf 2)
GREY=$(tput setaf 7) # fallback; no native bright grey in tput, will appear as light gray or white on most

# --------------------------------------------------
# Logging functions (stderr for separation)
# --------------------------------------------------
log_debug()   { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${GREY}[DEBUG]${RESET}   $*" >&2; }
log_info()    { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${BLUE}[INFO]${RESET}    $*" >&2; }
log_warning() { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${YELLOW}[WARNING]${RESET} $*" >&2; }
log_error()   { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${RED}[ERROR]${RESET}   $*" >&2; }
log_fatal()   { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${RED}[FATAL]${RESET}   $*" >&2; exit 1; }
log_success() { echo -e "$(date '+%Y-%m-%d T%H:%M:%S%z') ${BOLD}${GREEN}[SUCCESS]${RESET} $*" >&2; }
