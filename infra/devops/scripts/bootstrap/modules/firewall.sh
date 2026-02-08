#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_FIREWALL:-1}" != "1" ]]; then
  log "INFO" "ENABLE_FIREWALL=0, skipping firewall module."
  exit 0
fi

require_root
apt_install_if_missing ufw

SSH_PORT="${SSH_PORT:-22}"
UFW_ALLOW_SSH_CIDR="${UFW_ALLOW_SSH_CIDR:-}"

run "ufw default deny incoming"
run "ufw default allow outgoing"

if [[ -n "$UFW_ALLOW_SSH_CIDR" ]]; then
  run "ufw allow from $UFW_ALLOW_SSH_CIDR to any port $SSH_PORT proto tcp"
else
  run "ufw allow $SSH_PORT/tcp"
fi

if [[ "${ALLOW_HTTP:-1}" == "1" ]]; then
  run "ufw allow 80/tcp"
fi

if [[ "${ALLOW_HTTPS:-1}" == "1" ]]; then
  run "ufw allow 443/tcp"
fi

run "ufw --force enable"
