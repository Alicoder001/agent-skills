#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${REVOKE_TEMP_ACCESS_AT_END:-1}" != "1" ]]; then
  log "INFO" "REVOKE_TEMP_ACCESS_AT_END=0, skipping cleanup/revoke module."
  exit 0
fi

require_root

TEMP_AGENT_KEY_TAG="${TEMP_AGENT_KEY_TAG:-bootstrap-temp-agent}"
TEMP_AGENT_USER="${TEMP_AGENT_USER:-ai-temp}"
APP_USER="${APP_USER:-}"

if [[ -n "$TEMP_AGENT_USER" ]]; then
  remove_lines_containing_text "/home/$TEMP_AGENT_USER/.ssh/authorized_keys" "$TEMP_AGENT_KEY_TAG"
fi

if [[ -n "$APP_USER" ]]; then
  remove_lines_containing_text "/home/$APP_USER/.ssh/authorized_keys" "$TEMP_AGENT_KEY_TAG"
fi

if [[ "${TEMP_AGENT_ENABLE_SUDO:-0}" == "1" ]]; then
  SUDOERS_FILE="/etc/sudoers.d/${TEMP_AGENT_USER}-bootstrap"
  if [[ -f "$SUDOERS_FILE" ]]; then
    run "rm -f $SUDOERS_FILE"
  fi
fi

if [[ "${TEMP_AGENT_DELETE_AT_END:-1}" == "1" ]]; then
  if id "$TEMP_AGENT_USER" >/dev/null 2>&1; then
    [[ "$TEMP_AGENT_USER" != "root" ]] || die "Refusing to delete root user."
    [[ "$TEMP_AGENT_USER" != "$APP_USER" ]] || die "Refusing to delete APP_USER."
    run "userdel -r $TEMP_AGENT_USER"
  fi
fi

if [[ -n "${TOKEN_REVOKE_COMMAND:-}" ]]; then
  run "$TOKEN_REVOKE_COMMAND"
fi

if [[ -n "${DEPLOY_KEY_ROTATE_COMMAND:-}" ]]; then
  run "$DEPLOY_KEY_ROTATE_COMMAND"
fi
