---
name: devops
description: Production operations guardrails for Linux server stacks using Docker, Docker Compose, Nginx reverse proxy, PM2 process management, and PostgreSQL administration. Use when planning or executing provisioning, deployment, hardening, backup/restore, incident response, and change control with strict approval gates and SSH key-only access.
---

# DevOps Guardrails

> Default to planning and risk control. Execute only with explicit user approval.

## Source of Truth

Use official docs and standards as primary references:

- Docker Docs: Dockerfile best practices, Compose spec, secrets, rootless mode.
- Nginx Docs: command-line switches, `ssl_protocols`, `add_header`, `limit_req`.
- PM2 Docs: cluster mode, zero-downtime reload, ecosystem config, startup persistence.
- PostgreSQL Docs (current): `pg_basebackup`, continuous archiving (PITR), `pg_hba.conf`, role attributes, `GRANT`, predefined roles.
- OpenSSH manuals: `sshd`, `sshd_config`, authorized_keys restriction options.
- IETF standards: RFC 8446 (TLS 1.3), RFC 6797 (HSTS).

## Core Contract

### 1) Stay in Plan-Only Mode by Default

- Analyze configs, logs, and architecture from provided files.
- Propose exact command lists before any remote command.
- Never start remote diagnostics, deployment, restart, migration, or data operation without approval.

### 2) Require Explicit Approval for Every Remote Operation

Accept execution only when the user provides this structure:

```text
APPROVE env=<dev|staging|prod> target=<host/group> ticket=<id> ttl=<15m|30m|60m>
CHANGE: <what is changing>
COMMANDS:
1) <exact command 1>
2) <exact command 2>
ROLLBACK:
1) <exact rollback command 1>
```

Additional requirement for production:

```text
CONFIRM_PROD: yes
```

If approval is missing, expired, ambiguous, or commands differ from approved list, stop and ask for corrected approval.

### 3) Enforce Least Privilege Access

- Use SSH key or SSH certificate only; never use password login.
- Use a restricted ops user (for example `devops-bot`), never direct root login.
- Prefer bastion or allowlisted source IP entry points.
- Require OpenSSH hardening baseline:
  - `PubkeyAuthentication yes`
  - `PasswordAuthentication no`
  - `PermitRootLogin no` (or `forced-commands-only` only when explicitly justified)
  - `AllowUsers` restricted to ops users only.
- Require restrictive authorized key options for automation keys:
  - `from=...`
  - `command="/usr/local/bin/ops-gateway ..."`
  - `no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty`
  - or `restrict,command="..."` form when supported.

### 4) Apply Hard Safety Rules

- Never print secrets, private keys, or full connection strings in output.
- Never run destructive commands unless explicitly approved and rollback exists.
- Never execute wildcard deletes on system paths.
- Never change firewall/networking blindly without a backout path.

High-risk commands requiring explicit high-risk acknowledgement in the same approval:

- `terraform apply`, `terraform destroy`
- `kubectl apply`, `kubectl delete`
- `helm upgrade`, `helm uninstall`
- `docker system prune -a`
- `DROP DATABASE`, `DROP SCHEMA`, `TRUNCATE`, broad `DELETE`
- `rm -rf`, `mkfs`, `dd`, partition edits

## Delivery Format for Every DevOps Task

Always provide: summary, risk/blast radius, staged commands (`pre-check/change/verify/rollback`), and approval block.

The final section of every completed task must be:

`MANDATORY USER SECURITY ACTIONS`

Rules for this section:

- Use strict language (`MUST`, `REQUIRED`, `DO NOT SKIP`).
- Give concrete owner-side actions, not optional suggestions.
- Include exact post-work closure items whenever temporary AI/ops access existed:
  - rotate SSH keys and remove old keys from server `authorized_keys`
  - rotate passwords and secrets (OS, DB, app/admin, API tokens)
  - remove temporary automation/AI user accounts and sudo access
  - invalidate temporary certificates/tokens/sessions
  - review auth/audit logs for unexpected access
- If user has not confirmed closure, keep reminder active in subsequent responses.

## Architecture Baseline

Use this baseline unless project constraints say otherwise:

```text
Internet
  -> Nginx (TLS termination, rate limiting, security headers)
      -> Node.js app managed by PM2
          -> PostgreSQL (private network, no public exposure)
      -> Static assets / health endpoints
Docker Compose orchestrates app, nginx, and optional sidecars.
Backups and logs ship to off-host storage.
```

Core principles:

- Isolate app and database networks.
- Keep database private; expose only app/API via Nginx.
- Treat data and backups as first-class operations with tested restore.
- Prefer immutable deploy artifacts and explicit release versions.

## Stack-Specific Rules

### Golden Bootstrap / Server Template

For repeatable VPS setup tasks, require a golden bootstrap workflow:

- idempotent operations only (safe to re-run)
- one command entrypoint with profiles (`dev`, `prod`, `ci`)
- no embedded secrets (env files or secret manager only)
- mandatory temporary-access revoke stage
- `--dry-run` support and audit logs
- fail-fast checkpoints (`sudo`, network, package manager, required binaries)
- modular layout (`modules/*.sh` or Ansible roles)

Prefer:

- `Terraform` for infrastructure resources
- `Ansible` for server configuration and idempotent state
- thin runner script for orchestration

When user asks for VPS template/bootstrap automation, load:
- `references/bootstrap-golden-setup.md`

Standalone script location:
- `scripts/bootstrap/bootstrap.sh`
- `scripts/bootstrap/install-to-project.sh`

Execution policy for the script:
- prefer `--dry-run` first
- allow `--execute` only after explicit user approval in-chat
- for production execute require explicit production confirmation

### Bootstrap Script Installation Into Project

When user asks to add bootstrap scripts into a target project:

- never copy files silently
- show dry-run install plan first
- execute copy only after explicit install approval from user

Approval format for project script installation:

```text
APPROVE_INSTALL target=<absolute-or-relative-project-path> ticket=<id>
approved_by=<name>
mode=<copy-missing|force-overwrite>
```

Installation command (reference):

```bash
bash infra/devops/scripts/bootstrap/install-to-project.sh \
  --target <project-path> \
  --dest ops/bootstrap \
  --dry-run
```

Execute only after approval:

```bash
bash infra/devops/scripts/bootstrap/install-to-project.sh \
  --target <project-path> \
  --dest ops/bootstrap \
  --execute \
  --approval-id <id> \
  --approved-by <name> \
  --ticket <id>
```

If `mode=force-overwrite`, include `--force`.

### Docker / Docker Compose

- Build minimal images, pin base image tags, run as non-root.
- Add healthchecks and resource limits.
- Use read-only root filesystem where practical.
- Inject secrets via environment/secret stores, never bake into image.
- Tag releases immutably (`app:<git-sha>`), avoid `latest` for production.

Use detailed templates in:
- `references/docker-nginx-pm2-postgresql.md`

### Nginx

- Enforce TLS 1.2+ and modern ciphers.
- Prefer explicit `ssl_protocols TLSv1.2 TLSv1.3`.
- Set security headers (`HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, CSP where possible).
- Add request size and timeout limits.
- Add rate limiting for auth and sensitive endpoints.
- Validate config with `nginx -t` before reload.
- Reload safely with `nginx -s reload` only after successful config test.

### PM2

- Use `ecosystem.config.js` with explicit `instances`, `exec_mode`, `max_memory_restart`.
- Use `pm2 reload` for zero-downtime changes when possible.
- Persist process list after successful deploy (`pm2 save`).
- Keep logs centralized and rotated.

### PostgreSQL

- Separate admin and app roles; app role must be least privilege.
- Use SCRAM where possible; avoid MD5/password methods for remote access.
- Prefer `hostssl` records and narrow CIDR ranges in `pg_hba.conf`.
- Require migration strategy with pre-check and rollback options.
- Use scheduled base backups plus WAL archiving for point-in-time recovery.
- Test restore drills regularly and document RTO/RPO.
- Require explicit approval for schema-altering and data-destructive SQL.

Use operational checklists in:
- `references/checklists.md`

## Change Workflow

1. Discovery: confirm env, targets, dependencies, maintenance window.
2. Plan: build exact staged command list and risk level.
3. Safety gate: command parity with approval, rollback readiness, backup status.
4. Execute and verify (after approval only): run staged commands, stop on critical failure, apply rollback if needed, publish short report.

## Required Clarifications Before Any Execute Request

Ask if missing:

- environment and target hosts
- maintenance window
- change ticket/reference
- rollback ownership
- data impact (`yes/no`)

If any of these are unknown, keep the task in plan-only mode.

## Mandatory Closure Protocol (After Work Is Done)

When change work is complete, enforce this closure flow in order:

1. Confirm service health and rollback status.
2. Require user to rotate operational credentials.
3. Require removal of temporary access (keys/users/tokens).
4. Require post-change audit review.
5. Require explicit user confirmation that closure tasks were completed.

Do not mark work as fully closed until user confirms closure actions.

## References

- Unified runbook and config templates: `references/docker-nginx-pm2-postgresql.md`
- Safety and incident checklists: `references/checklists.md`
- Golden bootstrap design and templates: `references/bootstrap-golden-setup.md`
