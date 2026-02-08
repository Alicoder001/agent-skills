#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE=""
MODE="dry-run"
DRY_RUN="1"
APPROVAL_ID=""
APPROVED_BY=""
TICKET=""
CONFIRM_PROD=""
LOG_FILE=""

usage() {
  cat <<'EOF'
Usage:
  ./bootstrap.sh <dev|prod|ci> [--dry-run]
  ./bootstrap.sh <dev|prod|ci> --execute --approval-id <id> --approved-by <name> --ticket <id> [--confirm-prod yes]

Options:
  --dry-run                Show actions only (default mode).
  --execute                Apply changes (requires approval args).
  --approval-id <id>       Approval reference for execution mode.
  --approved-by <name>     Human approver identity.
  --ticket <id>            Change ticket/issue reference.
  --confirm-prod yes       Required for prod execute mode.
  --log-file <path>        Override default log file path.
  --profile <name>         Alternative profile selector.
  -h, --help               Show this help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    dev|prod|ci)
      PROFILE="$1"
      shift
      ;;
    --profile)
      PROFILE="${2:-}"
      shift 2
      ;;
    --profile=*)
      PROFILE="${1#*=}"
      shift
      ;;
    --dry-run)
      MODE="dry-run"
      DRY_RUN="1"
      shift
      ;;
    --execute)
      MODE="execute"
      DRY_RUN="0"
      shift
      ;;
    --approval-id)
      APPROVAL_ID="${2:-}"
      shift 2
      ;;
    --approval-id=*)
      APPROVAL_ID="${1#*=}"
      shift
      ;;
    --approved-by)
      APPROVED_BY="${2:-}"
      shift 2
      ;;
    --approved-by=*)
      APPROVED_BY="${1#*=}"
      shift
      ;;
    --ticket)
      TICKET="${2:-}"
      shift 2
      ;;
    --ticket=*)
      TICKET="${1#*=}"
      shift
      ;;
    --confirm-prod)
      CONFIRM_PROD="${2:-}"
      shift 2
      ;;
    --confirm-prod=*)
      CONFIRM_PROD="${1#*=}"
      shift
      ;;
    --log-file)
      LOG_FILE="${2:-}"
      shift 2
      ;;
    --log-file=*)
      LOG_FILE="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

PROFILE="${PROFILE:-dev}"
case "$PROFILE" in
  dev|prod|ci) ;;
  *)
    echo "Invalid profile: $PROFILE (expected dev|prod|ci)" >&2
    exit 1
    ;;
esac

PROFILE_FILE="$ROOT_DIR/profiles/${PROFILE}.env"
if [[ ! -f "$PROFILE_FILE" ]]; then
  echo "Profile not found: $PROFILE_FILE" >&2
  exit 1
fi

source "$PROFILE_FILE"

if [[ -z "$LOG_FILE" ]]; then
  LOG_FILE="/var/log/bootstrap-${PROFILE}.log"
fi
if ! mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null; then
  LOG_FILE="/tmp/bootstrap-${PROFILE}.log"
fi
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/bootstrap-${PROFILE}.log"
touch "$LOG_FILE"

export BOOTSTRAP_PROFILE="$PROFILE"
export BOOTSTRAP_DRY_RUN="$DRY_RUN"
export BOOTSTRAP_LOG_FILE="$LOG_FILE"

# shellcheck source=./lib/common.sh
source "$ROOT_DIR/lib/common.sh"

require_root
require_cmd bash
require_cmd systemctl

if [[ "$MODE" == "execute" ]]; then
  [[ -n "$APPROVAL_ID" ]] || die "Missing --approval-id for execute mode."
  [[ -n "$APPROVED_BY" ]] || die "Missing --approved-by for execute mode."
  [[ -n "$TICKET" ]] || die "Missing --ticket for execute mode."
  if [[ "$PROFILE" == "prod" && "$CONFIRM_PROD" != "yes" ]]; then
    die "Prod execute requires --confirm-prod yes."
  fi
  log "INFO" "Execution approved. approval_id=$APPROVAL_ID approved_by=$APPROVED_BY ticket=$TICKET"
else
  log "INFO" "Dry-run mode active. No changes will be applied."
fi

run_module() {
  local module="$1"
  local module_path="$ROOT_DIR/modules/${module}.sh"
  [[ -f "$module_path" ]] || die "Module not found: $module_path"
  log "INFO" "Starting module: $module"
  bash "$module_path"
  log "INFO" "Completed module: $module"
}

declare -a modules
if [[ -n "${BOOTSTRAP_MODULES:-}" ]]; then
  read -r -a modules <<<"$BOOTSTRAP_MODULES"
else
  modules=(base firewall docker nginx node_pm2 postgresql app_user observability)
fi

if [[ "${ENABLE_TEMP_AGENT_ACCESS:-0}" == "1" ]]; then
  modules+=(deploy_keys)
fi
modules+=(cleanup_revoke)

log "INFO" "Profile=$PROFILE mode=$MODE modules=${modules[*]}"

for module in "${modules[@]}"; do
  run_module "$module"
done

log "INFO" "Bootstrap completed. profile=$PROFILE mode=$MODE log=$LOG_FILE"
