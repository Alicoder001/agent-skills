#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_TEMP_AGENT_ACCESS:-0}" != "1" ]]; then
  log "INFO" "ENABLE_TEMP_AGENT_ACCESS=0, skipping deploy_keys module."
  exit 0
fi

require_root

TEMP_AGENT_USER="${TEMP_AGENT_USER:-ai-temp}"
TEMP_AGENT_SHELL="${TEMP_AGENT_SHELL:-/usr/sbin/nologin}"
TEMP_AGENT_KEY_TAG="${TEMP_AGENT_KEY_TAG:-bootstrap-temp-agent}"
TEMP_AGENT_PUBKEY_FILE="${TEMP_AGENT_PUBKEY_FILE:-}"

[[ -n "$TEMP_AGENT_PUBKEY_FILE" ]] || die "TEMP_AGENT_PUBKEY_FILE is required when ENABLE_TEMP_AGENT_ACCESS=1."
[[ -f "$TEMP_AGENT_PUBKEY_FILE" ]] || die "TEMP_AGENT_PUBKEY_FILE not found: $TEMP_AGENT_PUBKEY_FILE"

ensure_user_exists "$TEMP_AGENT_USER" "$TEMP_AGENT_SHELL"
ensure_directory "/home/$TEMP_AGENT_USER/.ssh" "$TEMP_AGENT_USER:$TEMP_AGENT_USER" "0700"

while IFS= read -r key || [[ -n "$key" ]]; do
  key="${key%$'\r'}"
  [[ -z "$key" ]] && continue
  ensure_line_in_file "/home/$TEMP_AGENT_USER/.ssh/authorized_keys" "$key $TEMP_AGENT_KEY_TAG" "$TEMP_AGENT_USER:$TEMP_AGENT_USER" "0600"
done <"$TEMP_AGENT_PUBKEY_FILE"

if [[ "${TEMP_AGENT_ENABLE_SUDO:-0}" == "1" ]]; then
  TEMP_AGENT_SUDO_COMMANDS="${TEMP_AGENT_SUDO_COMMANDS:-/usr/bin/systemctl,/usr/bin/docker,/usr/bin/journalctl}"
  SUDOERS_FILE="/etc/sudoers.d/${TEMP_AGENT_USER}-bootstrap"

  write_file_if_changed "$SUDOERS_FILE" "root:root" "0440" <<EOF
${TEMP_AGENT_USER} ALL=(ALL) NOPASSWD: ${TEMP_AGENT_SUDO_COMMANDS}
EOF
  run "visudo -cf $SUDOERS_FILE"
fi
