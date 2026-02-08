# Unified DevOps Runbook (Docker + Nginx + PM2 + PostgreSQL)

## Table of Contents

1. Standards Mapping
2. Architecture Baselines
3. Docker and Compose Baseline
4. Nginx Reverse Proxy Baseline
5. PM2 Runtime Baseline
6. PostgreSQL Baseline
7. Change Plan Template
8. Primary Sources

## 1) Standards Mapping

| Area | Source | Practical Rule |
|---|---|---|
| TLS | RFC 8446 | Allow TLS 1.2/1.3 only; disable legacy protocols. |
| HSTS | RFC 6797 | Send strict HSTS header on HTTPS responses. |
| SSH Access | OpenSSH `sshd`, `sshd_config` | Key-only auth, no direct root login, restrict key capabilities. |
| Container Build | Docker Build best practices | Multi-stage builds, minimal base images, non-root runtime user. |
| Container Orchestration | Compose Spec | Use healthchecks, controlled dependencies, secrets, restart policy. |
| DB Recovery | PostgreSQL backup/recovery docs | Base backups + WAL archive for point-in-time recovery (PITR). |

## 2) Architecture Baselines

### Pattern A: Single Host (small to medium workload)

```text
Internet
  -> Nginx (TLS termination, security headers, rate limit)
      -> App container (Node.js)
          -> PM2 inside app container
      -> PostgreSQL container on private bridge network only
```

Use when:
- One VM is acceptable.
- You have strict backups and restore drills.

### Pattern B: Split Data Plane (recommended for production growth)

```text
Internet
  -> Nginx host/container
      -> App host/container (PM2)
          -> Managed PostgreSQL or dedicated DB host (private subnet only)
```

Use when:
- Higher availability and stronger blast-radius control are required.

## 3) Docker and Compose Baseline

### Dockerfile Template (Node.js service)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "dist/server.js"]
```

### Compose Template (with health and secrets)

```yaml
services:
  app:
    image: ghcr.io/org/app:${APP_IMAGE_TAG}
    user: "10001:10001"
    read_only: true
    tmpfs:
      - /tmp
    environment:
      NODE_ENV: production
      DATABASE_URL_FILE: /run/secrets/db_url
    secrets:
      - db_url
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/healthz"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 20s
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks: [edge, data]

  nginx:
    image: nginx:1.27-alpine
    depends_on:
      app:
        condition: service_healthy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certs:/etc/nginx/certs:ro
    restart: unless-stopped
    networks: [edge]

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped
    networks: [data]

networks:
  edge: {}
  data:
    internal: true

volumes:
  pgdata: {}

secrets:
  db_password:
    file: ./secrets/db_password.txt
  db_url:
    file: ./secrets/db_url.txt
```

### Docker Rules

- Pin images to explicit versions (or digests for stricter immutability).
- Avoid `latest` in production deploy artifacts.
- Keep root filesystem read-only where feasible.
- Keep secrets out of images and git.
- Run containers with non-root user.

## 4) Nginx Reverse Proxy Baseline

### Hardened Server Template

```nginx
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

upstream app_upstream {
    server app:3000;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;

    client_max_body_size 10m;

    location /auth/ {
        limit_req zone=auth_limit burst=10 nodelay;
        proxy_pass http://app_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://app_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Safe Nginx Reload

```bash
nginx -t
nginx -s reload
```

Never reload without successful `nginx -t`.

## 5) PM2 Runtime Baseline

### Ecosystem Template

```js
module.exports = {
  apps: [
    {
      name: "api",
      script: "dist/server.js",
      exec_mode: "cluster",
      instances: "max",
      max_memory_restart: "300M",
      listen_timeout: 8000,
      kill_timeout: 5000,
      time: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

### Operational Commands

```bash
pm2 start ecosystem.config.js --env production
pm2 reload api
pm2 save
pm2 startup
```

Notes:
- `pm2 reload` is the zero-downtime path for cluster mode.
- Persist process list only after a healthy deploy.

## 6) PostgreSQL Baseline

### Access and Auth

`pg_hba.conf` example:

```conf
hostssl appdb app_user 10.10.20.0/24 scram-sha-256
hostssl replication replicator 10.10.30.10/32 scram-sha-256
```

Rules:
- Prefer `hostssl` for networked access.
- Prefer `scram-sha-256`; MD5 is deprecated in PostgreSQL docs.
- Keep CIDR ranges narrow.

### Role Model

```sql
CREATE ROLE app_user LOGIN;
CREATE ROLE migrator LOGIN;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
```

Use predefined monitoring roles where possible instead of broad superuser access.

### Backup + PITR Baseline

`postgresql.conf` example:

```conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
max_wal_senders = 5
```

Base backup example:

```bash
pg_basebackup \
  -D /var/backups/postgres/base_$(date +%F_%H%M) \
  -Ft -z -P -X stream -U replicator
```

For point-in-time recovery, use archived WAL + recovery target settings and verify recovery with drills.

## 7) Change Plan Template

```text
Change: <summary>
Env: <dev|staging|prod>
Target: <host/service>
Risk: <low|medium|high>
Blast Radius: <users/services/data>

Pre-check:
1) <command>
2) <command>

Change:
1) <command>
2) <command>

Verify:
1) <command>
2) <command>

Rollback:
1) <command>
2) <command>
```

Use this together with the approval gate in `infra/devops/SKILL.md`.

## 8) Primary Sources

- Docker build best practices: https://docs.docker.com/build/building/best-practices/
- Compose file reference: https://docs.docker.com/reference/compose-file/
- Compose secrets: https://docs.docker.com/compose/how-tos/use-secrets/
- Rootless mode: https://docs.docker.com/engine/security/rootless/
- Nginx command-line switches: https://nginx.org/en/docs/switches.html
- Nginx SSL module (`ssl_protocols`): https://nginx.org/en/docs/http/ngx_http_ssl_module.html
- Nginx headers module (`add_header`): https://nginx.org/en/docs/http/ngx_http_headers_module.html
- Nginx rate limit module (`limit_req`): https://nginx.org/en/docs/http/ngx_http_limit_req_module.html
- Nginx core (`client_max_body_size`): https://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size
- PM2 single-page docs (cluster, reload, startup): https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
- PM2 ecosystem file: https://pm2.keymetrics.io/docs/usage/application-declaration/
- PostgreSQL `pg_basebackup`: https://www.postgresql.org/docs/current/app-pgbasebackup.html
- PostgreSQL continuous archiving and PITR: https://www.postgresql.org/docs/current/continuous-archiving.html
- PostgreSQL client auth (`pg_hba.conf`): https://www.postgresql.org/docs/current/auth-pg-hba-conf.html
- PostgreSQL role attributes: https://www.postgresql.org/docs/current/role-attributes.html
- PostgreSQL `GRANT`: https://www.postgresql.org/docs/current/sql-grant.html
- PostgreSQL predefined roles: https://www.postgresql.org/docs/current/predefined-roles.html
- OpenSSH daemon manual (`authorized_keys` options): https://man.openbsd.org/sshd
- OpenSSH server config (`PasswordAuthentication`, `PermitRootLogin`): https://man.openbsd.org/sshd_config
- RFC 8446 (TLS 1.3): https://datatracker.ietf.org/doc/html/rfc8446
- RFC 6797 (HSTS): https://datatracker.ietf.org/doc/html/rfc6797
