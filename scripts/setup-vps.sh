#!/usr/bin/env bash
# =============================================================================
# USM Platform — one-time VPS bootstrap (Ubuntu)
# =============================================================================
# Installs Git, Docker Engine + Compose plugin, and configures ufw so only
# SSH/HTTP/HTTPS are reachable. Safe to run more than once — every step checks
# whether it already did its job before doing it again.
#
# Usage (as a sudo-capable user, e.g. ubuntu):
#   curl -fsSL https://raw.githubusercontent.com/declared-as-ala/usmo/main/scripts/setup-vps.sh | bash
#   # or, after cloning:
#   bash scripts/setup-vps.sh
# =============================================================================
set -euo pipefail

DEPLOY_DIR="/var/www/usmo"
DEPLOY_USER="${SUDO_USER:-$USER}"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
ok()   { printf '    \033[0;32m✓ %s\033[0m\n' "$1"; }

require_sudo() {
  if [ "$(id -u)" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
    echo "This script needs root or sudo. Aborting." >&2
    exit 1
  fi
}
require_sudo

# ── 1. System packages ───────────────────────────────────────────────────────
log "Updating apt package index"
sudo apt-get update -y

log "Installing base packages (git, curl, ufw, ca-certificates)"
sudo apt-get install -y --no-install-recommends \
  git curl ca-certificates gnupg ufw
ok "Base packages installed"

# ── 2. Docker Engine + Compose plugin ────────────────────────────────────────
if command -v docker >/dev/null 2>&1; then
  ok "Docker already installed ($(docker --version))"
else
  log "Installing Docker Engine (official convenience script)"
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  rm -f /tmp/get-docker.sh
  ok "Docker installed ($(docker --version))"
fi

if docker compose version >/dev/null 2>&1; then
  ok "Docker Compose plugin already available ($(docker compose version))"
else
  log "Installing Docker Compose plugin"
  sudo apt-get install -y docker-compose-plugin
  ok "Docker Compose plugin installed ($(docker compose version))"
fi

# Let the deploy user run docker without sudo.
if id -nG "$DEPLOY_USER" | grep -qw docker; then
  ok "$DEPLOY_USER is already in the docker group"
else
  log "Adding $DEPLOY_USER to the docker group"
  sudo usermod -aG docker "$DEPLOY_USER"
  echo "    (log out and back in — or run 'newgrp docker' — for this to take effect in this shell)"
fi

sudo systemctl enable --now docker
ok "Docker service enabled and running"

# ── 3. Firewall (ufw) ─────────────────────────────────────────────────────────
log "Configuring firewall (deny incoming by default; allow SSH, HTTP, HTTPS)"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    comment 'SSH'
sudo ufw allow 80/tcp    comment 'HTTP'
sudo ufw allow 443/tcp   comment 'HTTPS'
# Explicitly do NOT open 3000 (Next.js), 3001 (NestJS), 27017 (MongoDB),
# 9000/9001 (MinIO) — those stay on the internal Docker network only,
# reachable exclusively through the nginx container's 80/443.
if sudo ufw status | grep -q "Status: active"; then
  ok "ufw already active"
else
  sudo ufw --force enable
  ok "ufw enabled"
fi
sudo ufw status verbose

# ── 4. Deployment directory ───────────────────────────────────────────────────
log "Preparing deployment directory: $DEPLOY_DIR"
sudo mkdir -p "$DEPLOY_DIR"
sudo chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/deploy/certbot/conf" "$DEPLOY_DIR/deploy/certbot/www"
ok "$DEPLOY_DIR ready"

# ── 5. Certbot renewal cron (safe no-op until certs actually exist) ─────────
CRON_LINE="0 3 * * * cd $DEPLOY_DIR && docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload"
if sudo crontab -l -u "$DEPLOY_USER" 2>/dev/null | grep -qF "certbot renew"; then
  ok "Certbot renewal cron already present"
else
  log "Installing daily certbot renewal cron (03:00)"
  ( sudo crontab -l -u "$DEPLOY_USER" 2>/dev/null || true; echo "$CRON_LINE" ) | sudo crontab -u "$DEPLOY_USER" -
  ok "Certbot renewal cron installed"
fi

log "VPS bootstrap complete"
cat <<EOF

Next steps:
  1. git clone https://github.com/declared-as-ala/usmo.git $DEPLOY_DIR   (if not already cloned)
  2. cd $DEPLOY_DIR && cp .env.production.example .env && nano .env      (fill in real secrets)
  3. Point APP_DOMAIN and API_DOMAIN's DNS A records at this server's IP, and set -a; source .env; set +a
     so \$APP_DOMAIN etc. are available to the commands below.
  4. Start everything EXCEPT nginx (nginx can't start yet — its config needs
     certs that don't exist until step 5):
       docker compose -f docker-compose.prod.yml up -d mongo minio mc api web
  5. Issue the first certificates in standalone mode — one per domain, run
     BEFORE nginx is up so port 80 is free (see docker-compose.prod.yml's
     certbot service comments for the full explanation):
       docker run --rm -p 80:80 \\
         -v \$(pwd)/deploy/certbot/conf:/etc/letsencrypt \\
         -v \$(pwd)/deploy/certbot/www:/var/www/certbot \\
         certbot/certbot certonly --standalone \\
         -d \$APP_DOMAIN --email \$LETSENCRYPT_EMAIL --agree-tos --no-eff-email
       docker run --rm -p 80:80 \\
         -v \$(pwd)/deploy/certbot/conf:/etc/letsencrypt \\
         -v \$(pwd)/deploy/certbot/www:/var/www/certbot \\
         certbot/certbot certonly --standalone \\
         -d \$API_DOMAIN --email \$LETSENCRYPT_EMAIL --agree-tos --no-eff-email
  6. Now that certs exist, start nginx:
       docker compose -f docker-compose.prod.yml up -d nginx

  Future renewals reuse the already-running nginx via webroot mode — the
  cron entry this script installed handles that automatically.

EOF
