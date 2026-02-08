#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR=""
DEST_RELATIVE="ops/bootstrap"
MODE="dry-run"
FORCE="0"
APPROVAL_ID=""
APPROVED_BY=""
TICKET=""

usage() {
  cat <<'EOF'
Usage:
  ./install-to-project.sh --target <project-path> [--dest <relative-path>] [--dry-run]
  ./install-to-project.sh --target <project-path> [--dest <relative-path>] --execute --approval-id <id> --approved-by <name> --ticket <id> [--force]

Options:
  --target <path>         Absolute or relative path of target project.
  --dest <path>           Destination path inside project (default: ops/bootstrap).
  --dry-run               Preview copy plan (default mode).
  --execute               Perform copy operation.
  --force                 Overwrite existing files in destination.
  --approval-id <id>      Approval reference for execute mode.
  --approved-by <name>    Human approver identity.
  --ticket <id>           Change ticket/reference.
  -h, --help              Show this help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_DIR="${2:-}"
      shift 2
      ;;
    --target=*)
      TARGET_DIR="${1#*=}"
      shift
      ;;
    --dest)
      DEST_RELATIVE="${2:-}"
      shift 2
      ;;
    --dest=*)
      DEST_RELATIVE="${1#*=}"
      shift
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --execute)
      MODE="execute"
      shift
      ;;
    --force)
      FORCE="1"
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

[[ -n "$TARGET_DIR" ]] || { echo "Missing --target" >&2; exit 1; }
[[ -d "$TARGET_DIR" ]] || { echo "Target project does not exist: $TARGET_DIR" >&2; exit 1; }

if [[ "$MODE" == "execute" ]]; then
  [[ -n "$APPROVAL_ID" ]] || { echo "Missing --approval-id for execute mode." >&2; exit 1; }
  [[ -n "$APPROVED_BY" ]] || { echo "Missing --approved-by for execute mode." >&2; exit 1; }
  [[ -n "$TICKET" ]] || { echo "Missing --ticket for execute mode." >&2; exit 1; }
fi

DEST_DIR="$TARGET_DIR/$DEST_RELATIVE"

copy_list=(
  "install-to-project.sh"
  "bootstrap.sh"
  "lib/common.sh"
  "modules/base.sh"
  "modules/firewall.sh"
  "modules/docker.sh"
  "modules/nginx.sh"
  "modules/node_pm2.sh"
  "modules/postgresql.sh"
  "modules/app_user.sh"
  "modules/deploy_keys.sh"
  "modules/observability.sh"
  "modules/cleanup_revoke.sh"
  "profiles/dev.env"
  "profiles/prod.env"
  "profiles/ci.env"
)

echo "Install plan:"
echo "- Source: $ROOT_DIR"
echo "- Target project: $TARGET_DIR"
echo "- Destination: $DEST_DIR"
echo "- Mode: $MODE"
echo "- Force overwrite: $FORCE"
if [[ "$MODE" == "execute" ]]; then
  echo "- approval_id: $APPROVAL_ID"
  echo "- approved_by: $APPROVED_BY"
  echo "- ticket: $TICKET"
fi

for rel in "${copy_list[@]}"; do
  src="$ROOT_DIR/$rel"
  dst="$DEST_DIR/$rel"
  if [[ ! -f "$src" ]]; then
    echo "Source file missing: $src" >&2
    exit 1
  fi
  if [[ -f "$dst" ]]; then
    if [[ "$FORCE" == "1" ]]; then
      echo "[OVERWRITE] $rel"
    else
      echo "[SKIP] $rel (already exists)"
    fi
  else
    echo "[COPY] $rel"
  fi
done

if [[ "$MODE" != "execute" ]]; then
  echo "Dry-run only. Re-run with --execute and approval flags to apply."
  exit 0
fi

for rel in "${copy_list[@]}"; do
  src="$ROOT_DIR/$rel"
  dst="$DEST_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  if [[ -f "$dst" && "$FORCE" != "1" ]]; then
    continue
  fi
  install -m 0644 "$src" "$dst"
done

chmod 0755 "$DEST_DIR/bootstrap.sh"
chmod 0755 "$DEST_DIR/install-to-project.sh"

echo "Install completed: $DEST_DIR"
