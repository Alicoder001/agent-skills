#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_POSTGRES:-1}" != "1" ]]; then
  log "INFO" "ENABLE_POSTGRES=0, skipping postgresql module."
  exit 0
fi

require_root
apt_install_if_missing postgresql postgresql-client
ensure_service_enabled postgresql

if [[ -n "${PG_BOOTSTRAP_SQL_FILE:-}" ]]; then
  [[ -f "${PG_BOOTSTRAP_SQL_FILE}" ]] || die "PG_BOOTSTRAP_SQL_FILE not found: ${PG_BOOTSTRAP_SQL_FILE}"
  if [[ "$BOOTSTRAP_DRY_RUN" == "1" ]]; then
    log "DRYRUN" "sudo -u postgres psql -v ON_ERROR_STOP=1 -f ${PG_BOOTSTRAP_SQL_FILE}"
  else
    log "RUN" "sudo -u postgres psql -v ON_ERROR_STOP=1 -f <bootstrap-sql-file>"
    sudo -u postgres psql -v ON_ERROR_STOP=1 -f "${PG_BOOTSTRAP_SQL_FILE}" >>"$BOOTSTRAP_LOG_FILE" 2>&1 \
      || die "PostgreSQL bootstrap SQL failed."
  fi
fi
