#!/usr/bin/env bash
set -Eeuo pipefail

: "${BOOTSTRAP_DRY_RUN:=1}"
: "${BOOTSTRAP_LOG_FILE:=/tmp/bootstrap.log}"
: "${BOOTSTRAP_PROFILE:=dev}"

timestamp_utc() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}

log() {
  local level="$1"
  shift
  local msg="$*"
  local line
  line="$(timestamp_utc) [$level] [$BOOTSTRAP_PROFILE] $msg"
  printf '%s\n' "$line" | tee -a "$BOOTSTRAP_LOG_FILE"
}

die() {
  log "ERROR" "$*"
  exit 1
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_cmd() {
  has_cmd "$1" || die "Required command missing: $1"
}

require_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    die "Run as root (sudo)."
  fi
}

run() {
  local cmd="$*"
  if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
    log "DRYRUN" "$cmd"
    return 0
  fi
  log "RUN" "$cmd"
  bash -lc "$cmd" >>"$BOOTSTRAP_LOG_FILE" 2>&1 || die "Command failed: $cmd"
}

require_apt() {
  has_cmd apt-get || die "Only apt-based systems are supported by this bootstrap."
}

apt_install_if_missing() {
  require_apt
  local missing=()
  local pkg
  for pkg in "$@"; do
    dpkg -s "$pkg" >/dev/null 2>&1 || missing+=("$pkg")
  done
  if [[ ${#missing[@]} -eq 0 ]]; then
    log "INFO" "Packages already installed: $*"
    return 0
  fi
  run "DEBIAN_FRONTEND=noninteractive apt-get update -y"
  run "DEBIAN_FRONTEND=noninteractive apt-get install -y ${missing[*]}"
}

ensure_service_enabled() {
  local svc="$1"
  run "systemctl enable --now $svc"
}

ensure_directory() {
  local dir="$1"
  local owner="${2:-root:root}"
  local mode="${3:-0755}"
  local owner_user="${owner%%:*}"
  local owner_group="${owner##*:}"
  if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
    log "DRYRUN" "mkdir -p $dir && chown $owner_user:$owner_group $dir && chmod $mode $dir"
    return 0
  fi
  mkdir -p "$dir"
  chown "$owner_user:$owner_group" "$dir"
  chmod "$mode" "$dir"
}

ensure_user_exists() {
  local user="$1"
  local shell_path="${2:-/bin/bash}"
  if id "$user" >/dev/null 2>&1; then
    log "INFO" "User already exists: $user"
    return 0
  fi
  run "useradd -m -s $shell_path $user"
}

ensure_user_in_group() {
  local user="$1"
  local group="$2"
  getent group "$group" >/dev/null 2>&1 || run "groupadd $group"
  if id -nG "$user" | tr ' ' '\n' | grep -Fxq "$group"; then
    log "INFO" "User $user is already in group $group"
    return 0
  fi
  run "usermod -aG $group $user"
}

ensure_line_in_file() {
  local file="$1"
  local line="$2"
  local owner="${3:-root:root}"
  local mode="${4:-0600}"

  ensure_directory "$(dirname "$file")" "root:root" "0755"

  if [[ ! -f "$file" ]]; then
    if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
      log "DRYRUN" "touch $file"
    else
      touch "$file"
    fi
  fi

  if grep -Fqx -- "$line" "$file" 2>/dev/null; then
    log "INFO" "Line already present in $file"
    return 0
  fi

  if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
    log "DRYRUN" "Append line to $file"
    return 0
  fi

  printf '%s\n' "$line" >>"$file"
  chown "$owner" "$file"
  chmod "$mode" "$file"
  log "INFO" "Updated $file"
}

remove_lines_containing_text() {
  local file="$1"
  local needle="$2"
  if [[ ! -f "$file" ]]; then
    log "INFO" "File does not exist, skip remove: $file"
    return 0
  fi
  if ! grep -Fq -- "$needle" "$file"; then
    log "INFO" "No matching line in $file for text: $needle"
    return 0
  fi

  if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
    log "DRYRUN" "Remove lines containing '$needle' from $file"
    return 0
  fi

  local tmp
  tmp="$(mktemp)"
  local owner mode
  owner="$(stat -c '%u:%g' "$file")"
  mode="$(stat -c '%a' "$file")"
  awk -v needle="$needle" 'index($0, needle) == 0 { print }' "$file" >"$tmp"
  cat "$tmp" >"$file"
  rm -f "$tmp"
  chown "$owner" "$file"
  chmod "$mode" "$file"
  log "INFO" "Removed matching lines from $file"
}

write_file_if_changed() {
  local file="$1"
  local owner="${2:-root:root}"
  local mode="${3:-0644}"
  local owner_user="${owner%%:*}"
  local owner_group="${owner##*:}"
  local tmp
  tmp="$(mktemp)"
  cat >"$tmp"

  if [[ -f "$file" ]] && cmp -s "$tmp" "$file"; then
    rm -f "$tmp"
    log "INFO" "No change: $file"
    return 1
  fi

  if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
    log "DRYRUN" "Write file: $file"
    rm -f "$tmp"
    return 0
  fi

  ensure_directory "$(dirname "$file")" "root:root" "0755"
  install -m "$mode" -o "$owner_user" -g "$owner_group" "$tmp" "$file"
  rm -f "$tmp"
  log "INFO" "Wrote file: $file"
  return 0
}

ensure_symlink() {
  local target="$1"
  local link_path="$2"
  if [[ -L "$link_path" && "$(readlink "$link_path")" == "$target" ]]; then
    log "INFO" "Symlink already correct: $link_path -> $target"
    return 0
  fi
  run "ln -sfn $target $link_path"
}
