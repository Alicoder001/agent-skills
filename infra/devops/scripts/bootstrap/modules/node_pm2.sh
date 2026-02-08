#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_NODE_PM2:-1}" != "1" ]]; then
  log "INFO" "ENABLE_NODE_PM2=0, skipping node/pm2 module."
  exit 0
fi

require_root

if [[ "${INSTALL_NODE:-1}" == "1" ]]; then
  apt_install_if_missing nodejs npm
fi

if [[ "${INSTALL_PM2:-1}" == "1" ]]; then
  has_cmd npm || die "npm is required for PM2 installation."
  if ! has_cmd pm2; then
    run "npm install -g pm2"
  else
    log "INFO" "PM2 already installed."
  fi
  run "pm2 -v"
fi
