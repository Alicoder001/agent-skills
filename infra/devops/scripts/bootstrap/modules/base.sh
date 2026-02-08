#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

require_root
require_apt

apt_install_if_missing ca-certificates curl gnupg lsb-release git unzip jq logrotate

if [[ "${ENABLE_FAIL2BAN:-1}" == "1" ]]; then
  apt_install_if_missing fail2ban
  ensure_service_enabled fail2ban
else
  log "INFO" "ENABLE_FAIL2BAN=0, skipping fail2ban."
fi
