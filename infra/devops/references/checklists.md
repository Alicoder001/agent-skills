# DevOps Safety Checklists

## Table of Contents

1. Approval Gate Checklist
2. Pre-Change Checklist
3. Docker and Compose Change Checklist
4. Nginx Change Checklist
5. PM2 Change Checklist
6. PostgreSQL Migration Checklist
7. Backup and Restore Drill Checklist
8. Incident Response Checklist
9. Post-Change Report Template
10. Engagement Closure Checklist (Mandatory)

## 1) Approval Gate Checklist

Required before any remote command:

- Approval block present:
  - `APPROVE env=... target=... ticket=... ttl=...`
  - `CHANGE: ...`
  - `COMMANDS:` exact ordered list
  - `ROLLBACK:` exact ordered list
- TTL still valid.
- Commands to run exactly match approved commands.
- For production: `CONFIRM_PROD: yes` is present.
- Risk level recorded (`low|medium|high`).
- Blast radius recorded (services, users, data).

If any item is missing, do not execute.

## 2) Pre-Change Checklist

- Environment confirmed (`dev/staging/prod`).
- Target hosts and service names confirmed.
- On-call/owner notified.
- Monitoring dashboards ready (errors, latency, saturation).
- Logs stream ready.
- Recent backup status confirmed (for data-impacting changes).
- Restore path verified (at minimum dry-run documented).
- Maintenance window confirmed.
- Rollback owner assigned.

## 3) Docker and Compose Change Checklist

Before deploy:

- Image tag pinned and immutable (`vX.Y.Z` or commit SHA).
- No `latest` tags in production manifests.
- `docker compose config` renders without errors.
- Service `healthcheck` exists for critical services.
- Secrets are loaded via secret files/store, not hardcoded in image.
- Containers run as non-root unless explicitly justified.

Execute:

```bash
docker compose pull
docker compose up -d --no-deps <service>
docker compose ps
docker compose logs --tail=100 <service>
```

Verify:

- Service reports healthy.
- Error logs are clean.
- Public endpoints pass health checks.

Rollback:

```bash
docker compose up -d --no-deps <service>@<previous-tag-or-manifest>
```

## 4) Nginx Change Checklist

Before reload:

- Config diff reviewed.
- TLS cert path verified.
- Security headers preserved.
- Rate-limit rules reviewed for false positive impact.

Execute:

```bash
nginx -t
nginx -s reload
```

Verify:

- `/healthz` returns expected status.
- No 5xx spike after reload.
- No syntax/runtime errors in Nginx logs.

Rollback:

- Restore previous known-good config.
- Run `nginx -t` then `nginx -s reload`.

## 5) PM2 Change Checklist

Before reload:

- `ecosystem.config.js` diff reviewed.
- `instances` and `exec_mode` are correct for target host CPU.
- `max_memory_restart` defined for production apps.

Execute:

```bash
pm2 start ecosystem.config.js --env production
pm2 reload <app-name>
pm2 save
```

Verify:

- `pm2 status` shows all instances online.
- App error rate stable.
- p95 latency not regressing.

Rollback:

```bash
pm2 restart <app-name> --update-env
```

or deploy previous artifact then `pm2 reload`.

## 6) PostgreSQL Migration Checklist

Before migration:

- Migration reviewed for lock behavior and downtime risk.
- Backup completed and timestamp recorded.
- PITR prerequisites healthy (WAL archive path writable, recent base backup).
- Migration has explicit rollback SQL or restore plan.
- Data-impact level documented.

Execute (example flow):

```sql
BEGIN;
-- migration statements
COMMIT;
```

Prefer idempotent migrations and short transactions where possible.

Verify:

- Schema version table updated.
- Read/write smoke tests pass.
- Slow queries and lock waits checked.

Rollback:

- Execute rollback SQL if safe and validated.
- If not safe: restore to last known-good point using backup + WAL recovery.

## 7) Backup and Restore Drill Checklist

Backup checks:

- Base backups are scheduled and recent.
- WAL archive job is successful.
- Off-host copy exists.
- Retention policy is documented.

Restore drill checks:

- Restore performed in isolated environment.
- Recovery target time documented.
- Integrity checks executed (row counts, app smoke tests).
- Actual RTO and RPO measured and stored.

If drills fail, treat as production risk and block risky changes.

## 8) Incident Response Checklist

Trigger incident mode when:

- Service outage or sustained critical error rate.
- Data integrity concern.
- Security suspicion (credential leak, unauthorized access).

Actions:

1. Freeze non-essential changes.
2. Capture context (timestamps, host, service, impact).
3. Stabilize with lowest-risk rollback.
4. Preserve evidence (logs, config diff, commands executed).
5. Communicate status updates at fixed intervals.
6. After recovery, run post-incident analysis.

Never hide failed commands or partial rollbacks in reports.

## 9) Post-Change Report Template

```text
Ticket: <id>
Environment: <dev|staging|prod>
Start/End: <timestamps>
Change Summary: <what changed>
Commands Executed: <exact list>
Verification Results: <health, logs, metrics>
Rollback Used: <yes/no + details>
Incidents: <none or summary>
Next Actions: <follow-up tasks>
```

## 10) Engagement Closure Checklist (Mandatory)

Run this after operations are complete. These are required owner actions.

### Access and Identity Closure

- MUST generate a new SSH key pair for future operations.
- MUST add the new public key, verify access, then remove old keys from VPS `~/.ssh/authorized_keys`.
- MUST remove temporary AI/automation users from VPS when no longer needed.
- MUST remove any temporary sudoers entries and group memberships.
- MUST invalidate temporary SSH certificates, API tokens, and active sessions.

### Credential Rotation

- MUST rotate Linux account passwords used during operation.
- MUST rotate PostgreSQL passwords for affected roles.
- MUST rotate application secrets (JWT/API/app admin credentials).
- MUST rotate CI/CD deploy tokens or registry tokens if they were exposed to the operation.

### Data and Control-Plane Hardening

- MUST verify DB/user least privilege is restored.
- MUST ensure `PasswordAuthentication no` and key-only SSH remains enforced.
- MUST verify firewall/security group rules were not left widened.

### Audit and Confirmation

- MUST review SSH and auth logs for unknown access during the maintenance window.
- MUST review command history/audit trail against approved commands.
- MUST confirm closure completion explicitly in the final report.

Example command skeletons (adjust to your environment):

```bash
# rotate Linux password
passwd <ops_user>

# rotate PostgreSQL role password
psql -U postgres -d postgres -c "ALTER ROLE app_user WITH PASSWORD '<new-strong-password>';"

# remove temporary user and home
sudo userdel -r <temporary_ai_user>

# remove old key from authorized_keys (manual edit + verify)
sudo -u <ops_user> vi /home/<ops_user>/.ssh/authorized_keys
```
