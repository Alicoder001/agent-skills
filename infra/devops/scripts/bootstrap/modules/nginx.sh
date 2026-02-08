#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
source "$ROOT_DIR/lib/common.sh"

if [[ "${ENABLE_NGINX:-1}" != "1" ]]; then
  log "INFO" "ENABLE_NGINX=0, skipping nginx module."
  exit 0
fi

require_root
apt_install_if_missing nginx

NGINX_SERVER_NAME="${NGINX_SERVER_NAME:-_}"
APP_UPSTREAM="${APP_UPSTREAM:-127.0.0.1:3000}"
NGINX_ENABLE_TLS="${NGINX_ENABLE_TLS:-0}"
NGINX_TLS_CERT_PATH="${NGINX_TLS_CERT_PATH:-/etc/nginx/certs/fullchain.pem}"
NGINX_TLS_KEY_PATH="${NGINX_TLS_KEY_PATH:-/etc/nginx/certs/privkey.pem}"

write_file_if_changed "/etc/nginx/snippets/bootstrap-security-headers.conf" "root:root" "0644" <<'EOF'
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "no-referrer" always;
EOF

if [[ "$NGINX_ENABLE_TLS" == "1" ]]; then
  [[ -f "$NGINX_TLS_CERT_PATH" ]] || die "TLS enabled but certificate missing: $NGINX_TLS_CERT_PATH"
  [[ -f "$NGINX_TLS_KEY_PATH" ]] || die "TLS enabled but key missing: $NGINX_TLS_KEY_PATH"

  write_file_if_changed "/etc/nginx/sites-available/bootstrap-managed.conf" "root:root" "0644" <<EOF
upstream app_upstream {
    server ${APP_UPSTREAM};
    keepalive 32;
}

server {
    listen 80;
    server_name ${NGINX_SERVER_NAME};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${NGINX_SERVER_NAME};

    ssl_certificate ${NGINX_TLS_CERT_PATH};
    ssl_certificate_key ${NGINX_TLS_KEY_PATH};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    include /etc/nginx/snippets/bootstrap-security-headers.conf;
    client_max_body_size 10m;

    location / {
        proxy_pass http://app_upstream;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
else
  write_file_if_changed "/etc/nginx/sites-available/bootstrap-managed.conf" "root:root" "0644" <<EOF
upstream app_upstream {
    server ${APP_UPSTREAM};
    keepalive 32;
}

server {
    listen 80;
    server_name ${NGINX_SERVER_NAME};
    include /etc/nginx/snippets/bootstrap-security-headers.conf;
    client_max_body_size 10m;

    location / {
        proxy_pass http://app_upstream;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

ensure_symlink "/etc/nginx/sites-available/bootstrap-managed.conf" "/etc/nginx/sites-enabled/bootstrap-managed.conf"

if [[ -L "/etc/nginx/sites-enabled/default" || -f "/etc/nginx/sites-enabled/default" ]]; then
  run "rm -f /etc/nginx/sites-enabled/default"
fi

run "nginx -t"
ensure_service_enabled nginx
run "systemctl reload nginx"
