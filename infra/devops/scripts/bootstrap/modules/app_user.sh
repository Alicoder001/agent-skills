#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

require_root

APP_USER="${APP_USER:-appsvc}"
APP_SHELL="${APP_SHELL:-/bin/bash}"
APP_HOME="${APP_HOME:-/srv/${APP_USER}}"

[[ "$APP_USER" != "root" ]] || die "APP_USER cannot be root."

ensure_user_exists "$APP_USER" "$APP_SHELL"
ensure_directory "$APP_HOME" "$APP_USER:$APP_USER" "0750"
ensure_directory "/home/$APP_USER/.ssh" "$APP_USER:$APP_USER" "0700"

if [[ -n "${APP_USER_PUBKEY_FILE:-}" ]]; then
  [[ -f "${APP_USER_PUBKEY_FILE}" ]] || die "APP_USER_PUBKEY_FILE not found: ${APP_USER_PUBKEY_FILE}"
  while IFS= read -r key || [[ -n "$key" ]]; do
    key="${key%$'\r'}"
    [[ -z "$key" ]] && continue
    ensure_line_in_file "/home/$APP_USER/.ssh/authorized_keys" "$key" "$APP_USER:$APP_USER" "0600"
  done <"${APP_USER_PUBKEY_FILE}"
fi
