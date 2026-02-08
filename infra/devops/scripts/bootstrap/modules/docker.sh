#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_DOCKER:-1}" != "1" ]]; then
  log "INFO" "ENABLE_DOCKER=0, skipping docker module."
  exit 0
fi

require_root
apt_install_if_missing docker.io docker-compose-plugin
ensure_service_enabled docker

if [[ -n "${APP_USER:-}" ]] && id "${APP_USER}" >/dev/null 2>&1; then
  ensure_user_in_group "$APP_USER" docker
fi

run "docker --version"
run "docker compose version"
