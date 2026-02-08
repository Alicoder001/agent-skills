# Golden Bootstrap Pattern (VPS)

## Table of Contents

1. Objectives
2. Seven Mandatory Principles
3. Recommended Tooling Model
4. Folder Layout
5. Bash Orchestrator Skeleton
6. Module Contracts
7. Revoke and Closure Stage
8. Minimum Starter Modules
9. Validation Checklist
10. Install Into Another Project

## 1) Objectives

Create one repeatable, secure, auditable setup flow for VPS provisioning and hardening.

Reference implementation in this skill:
- `scripts/bootstrap/bootstrap.sh`
- `scripts/bootstrap/modules/*.sh`
- `scripts/bootstrap/profiles/*.env`

Usage examples:

```bash
# safe preview
bash infra/devops/scripts/bootstrap/bootstrap.sh prod --dry-run

# execute only with explicit approval context
bash infra/devops/scripts/bootstrap/bootstrap.sh prod \
  --execute \
  --approval-id CHG-241 \
  --approved-by admin \
  --ticket OPS-778 \
  --confirm-prod yes

# copy bootstrap toolkit into another project (preview first)
bash infra/devops/scripts/bootstrap/install-to-project.sh \
  --target /path/to/project \
  --dest ops/bootstrap \
  --dry-run
```

## 2) Seven Mandatory Principles

1. Idempotent behavior:
   - Re-running must not break host state.
   - Existing config must be checked before mutation.
2. One-command entrypoint with profiles:
   - `./bootstrap.sh dev`
   - `./bootstrap.sh prod`
   - `./bootstrap.sh ci`
3. No secrets in script:
   - Keep secrets in local env files or secret manager.
   - Script only reads resolved secret paths/variables.
4. Temporary access revoke flow:
   - End stage must remove temporary keys/users/tokens.
5. Dry-run and logging:
   - `--dry-run` prints intended actions only.
   - Write logs to persistent file.
6. Fail-fast checkpoints:
   - Stop early on missing requirements or unsafe context.
7. Modular design:
   - Split setup into module files (or Ansible roles).

## 3) Recommended Tooling Model

- Best long-term model:
  - Terraform: infra lifecycle (VPS/network/security groups)
  - Ansible: server configuration and idempotent package/service state
  - Runner script: profile-driven orchestration and CI entrypoint
- If single VPS and speed is priority:
  - Bash modules are acceptable initially, but keep modules strict and small.

## 4) Folder Layout

```text
scripts/bootstrap/
  bootstrap.sh
  profiles/
    dev.env
    prod.env
    ci.env
  modules/
    base.sh
    firewall.sh
    docker.sh
    nginx.sh
    node_pm2.sh
    postgresql.sh
    app_user.sh
    deploy_keys.sh
    observability.sh
    cleanup_revoke.sh
```

## 5) Bash Orchestrator Skeleton

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

PROFILE="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN="${DRY_RUN:-0}"
LOG_FILE="${LOG_FILE:-/var/log/bootstrap.log}"

usage() {
  echo "Usage: $0 <dev|prod|ci> [--dry-run]"
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    dev|prod|ci) PROFILE="$arg" ;;
    *) ;;
  esac
done

[[ -f "$ROOT_DIR/profiles/${PROFILE}.env" ]] || {
  echo "Missing profile env: $PROFILE" >&2
  exit 1
}

source "$ROOT_DIR/profiles/${PROFILE}.env"

run() {
  local cmd="$*"
  echo "[RUN] $cmd" | tee -a "$LOG_FILE"
  if [[ "$DRY_RUN" == "1" ]]; then
    return 0
  fi
  bash -lc "$cmd" 2>&1 | tee -a "$LOG_FILE"
}

require_root() {
  if [[ "$EUID" -ne 0 ]]; then
    echo "Run with sudo/root." >&2
    exit 1
  fi
}

require_root

run "bash $ROOT_DIR/modules/base.sh"
run "bash $ROOT_DIR/modules/firewall.sh"
run "bash $ROOT_DIR/modules/docker.sh"
run "bash $ROOT_DIR/modules/nginx.sh"
run "bash $ROOT_DIR/modules/node_pm2.sh"
run "bash $ROOT_DIR/modules/postgresql.sh"
run "bash $ROOT_DIR/modules/app_user.sh"

if [[ "${ENABLE_TEMP_AGENT_ACCESS:-0}" == "1" ]]; then
  run "bash $ROOT_DIR/modules/deploy_keys.sh"
fi

run "bash $ROOT_DIR/modules/cleanup_revoke.sh"
echo "Done. Profile=$PROFILE DryRun=$DRY_RUN Log=$LOG_FILE"
```

## 6) Module Contracts

Every module should:

- validate prerequisites first
- be idempotent (check-before-change)
- return non-zero on failure
- avoid handling secrets directly
- log significant changes

Recommended helper patterns inside each module:

- `command -v <bin>` for required binaries
- package install only if missing
- config write only if content changed
- service restart only when config changed and syntax check passes

## 7) Revoke and Closure Stage

`cleanup_revoke.sh` should enforce:

- remove temporary AI/automation user when no longer required
- remove temporary public keys from `authorized_keys`
- rotate deploy keys/tokens where temporary credentials were used
- remove temporary sudoers entries
- invalidate short-lived sessions/tokens if applicable

This stage must run at the end of every execution profile where temporary access is enabled.

## 8) Minimum Starter Modules

- `base.sh`: git, curl, unzip, fail2ban, time sync checks
- `firewall.sh`: ufw default deny, allow required ports only (`22`, `80`, `443` by profile)
- `docker.sh`: docker engine + compose plugin + daemon baseline
- `nginx.sh`: hardened reverse proxy baseline and syntax validation
- `node_pm2.sh`: runtime dependencies and PM2 baseline
- `postgresql.sh`: role/auth baseline, local-only/default private access
- `app_user.sh`: least-privileged deploy user and directory permissions
- `observability.sh`: node exporter/logrotate/journal retention baseline

## 9) Validation Checklist

After bootstrap:

- rerun with `--dry-run` and confirm no unexpected pending changes
- rerun live and confirm no drift-induced failures
- verify `sshd_config` hardening is active
- verify firewall rules match profile
- verify app stack health checks pass
- verify logs are written and readable by ops
- verify revoke stage removed temporary access artifacts

## 10) Install Into Another Project

Use `install-to-project.sh` to copy bootstrap assets into another repository.

Dry-run:

```bash
bash infra/devops/scripts/bootstrap/install-to-project.sh \
  --target /path/to/project \
  --dest ops/bootstrap \
  --dry-run
```

Execute (approval context required):

```bash
bash infra/devops/scripts/bootstrap/install-to-project.sh \
  --target /path/to/project \
  --dest ops/bootstrap \
  --execute \
  --approval-id CHG-501 \
  --approved-by admin \
  --ticket OPS-204
```

Add `--force` only when overwrite is explicitly approved.
