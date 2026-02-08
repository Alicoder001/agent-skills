#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_OBSERVABILITY:-1}" != "1" ]]; then
  log "INFO" "ENABLE_OBSERVABILITY=0, skipping observability module."
  exit 0
fi

require_root
apt_install_if_missing logrotate

if [[ "${ENABLE_NODE_EXPORTER:-0}" == "1" ]]; then
  apt_install_if_missing prometheus-node-exporter
  ensure_service_enabled prometheus-node-exporter
fi

JOURNAL_CHANGED=0
if write_file_if_changed "/etc/systemd/journald.conf.d/bootstrap.conf" "root:root" "0644" <<EOF
[Journal]
SystemMaxUse=${JOURNAL_SYSTEM_MAX_USE:-1G}
RuntimeMaxUse=${JOURNAL_RUNTIME_MAX_USE:-256M}
MaxRetentionSec=${JOURNAL_MAX_RETENTION_SEC:-14day}
EOF
then
  JOURNAL_CHANGED=1
fi

if [[ "$JOURNAL_CHANGED" == "1" ]]; then
  run "systemctl restart systemd-journald"
fi

write_file_if_changed "/etc/logrotate.d/bootstrap" "root:root" "0644" <<'EOF'
/var/log/bootstrap-*.log {
  rotate 14
  daily
  missingok
  notifempty
  compress
  delaycompress
  copytruncate
}
EOF
