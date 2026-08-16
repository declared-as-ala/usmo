#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$REPO_DIR/.env}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-240}"

cd "$REPO_DIR"

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

show_failure_context() {
  status=$?
  trap - ERR
  echo "[deploy] Deployment failed (exit $status)." >&2
  compose ps --all >&2 || true
  compose logs --tail=120 nginx api web >&2 || true
  exit "$status"
}
trap show_failure_context ERR

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] ERROR: production environment file is missing: $ENV_FILE" >&2
  false
fi

env_value_present() {
  local name=$1
  grep -Eq "^[[:space:]]*${name}[[:space:]]*=[[:space:]]*[^[:space:]#]" "$ENV_FILE"
}

if ! { env_value_present MINIO_ROOT_USER && env_value_present MINIO_ROOT_PASSWORD; } &&
   ! { env_value_present MINIO_ACCESS_KEY && env_value_present MINIO_SECRET_KEY; }; then
  echo "[deploy] ERROR: configure either MINIO_ROOT_USER/MINIO_ROOT_PASSWORD or the legacy MINIO_ACCESS_KEY/MINIO_SECRET_KEY pair." >&2
  false
fi

if [[ "${DEPLOY_SKIP_GIT_PULL:-0}" != 1 ]]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "[deploy] ERROR: tracked changes exist on the VPS; refusing to overwrite them." >&2
    false
  fi
  git fetch --prune origin "$DEPLOY_BRANCH"
  git checkout -B "$DEPLOY_BRANCH" "origin/$DEPLOY_BRANCH"
  git reset --hard "origin/$DEPLOY_BRANCH"
fi

echo "[deploy] Validating Compose interpolation and required environment variables..."
compose config --quiet

echo "[deploy] Building production images..."
compose build --pull api web nginx

echo "[deploy] Starting internal services before Nginx preflight..."
compose up -d mongo minio mc api web

echo "[deploy] Rendering and validating Nginx before replacing containers..."
compose run --rm --no-deps nginx nginx -t

echo "[deploy] Recreating services without taking the whole stack down..."
compose up -d --remove-orphans

services=(mongo minio api web nginx)
deadline=$((SECONDS + HEALTH_TIMEOUT))
while (( SECONDS < deadline )); do
  all_healthy=true
  for service in "${services[@]}"; do
    container_id="$(compose ps -q "$service")"
    if [[ -z "$container_id" ]]; then
      all_healthy=false
      continue
    fi
    state="$(docker inspect --format '{{.State.Status}}' "$container_id")"
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_id")"
    if [[ "$state" != running || ( "$health" != healthy && "$health" != none ) ]]; then
      all_healthy=false
    fi
  done
  if [[ "$all_healthy" == true ]]; then break; fi
  sleep 5
done

for service in "${services[@]}"; do
  container_id="$(compose ps -q "$service")"
  [[ -n "$container_id" ]] || { echo "[deploy] ERROR: $service has no container." >&2; false; }
  state="$(docker inspect --format '{{.State.Status}}' "$container_id")"
  health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_id")"
  if [[ "$state" != running || ( "$health" != healthy && "$health" != none ) ]]; then
    echo "[deploy] ERROR: $service is state=$state health=$health." >&2
    false
  fi
done

mc_id="$(compose ps --all -q mc)"
if [[ -n "$mc_id" && "$(docker inspect --format '{{.State.ExitCode}}' "$mc_id")" != 0 ]]; then
  echo "[deploy] ERROR: MinIO bucket initialization failed." >&2
  false
fi

echo "[deploy] Running internal and reverse-proxy checks..."
compose exec -T nginx nginx -t
compose exec -T api wget --quiet --output-document=/dev/null http://127.0.0.1:3001/api/health
compose exec -T web wget --quiet --output-document=/dev/null http://127.0.0.1:3000/
curl --noproxy '*' --fail --silent --show-error --output /dev/null http://127.0.0.1/nginx-health

app_domain="$(compose exec -T nginx sh -c 'printf %s "${APP_DOMAIN:-}"')"
api_domain="$(compose exec -T nginx sh -c 'printf %s "${API_DOMAIN:-}"')"
https_active=false
if compose exec -T nginx test -f /etc/nginx/conf.d/default.conf && compose exec -T nginx grep -q 'listen 443 ssl' /etc/nginx/conf.d/default.conf; then
  https_active=true
fi

if [[ "$https_active" == true ]]; then
  curl --noproxy '*' --fail --silent --show-error --location --output /dev/null --resolve "$app_domain:443:127.0.0.1" "https://$app_domain/"
  curl --noproxy '*' --fail --silent --show-error --output /dev/null --resolve "$api_domain:443:127.0.0.1" "https://$api_domain/api/health"
  frontend_url="https://$app_domain"
  api_url="https://$api_domain/api"
else
  public_host="${app_domain:-${DEPLOY_PUBLIC_HOST:-}}"
  [[ -n "$public_host" ]] || public_host="<vps-ip>"
  curl --noproxy '*' --fail --silent --show-error --output /dev/null -H "Host: $public_host" http://127.0.0.1/
  curl --noproxy '*' --fail --silent --show-error --output /dev/null -H "Host: $public_host" http://127.0.0.1/api/health
  frontend_url="http://$public_host"
  api_url="$frontend_url/api"
fi

compose ps
echo "[deploy] Frontend: $frontend_url"
echo "[deploy] API: $api_url"
echo "[deploy] API health: $api_url/health"
echo "[deploy] Admin: $frontend_url/admin"
echo "[deploy] Public media: $frontend_url/${MINIO_BUCKET:-usm-media}/"
echo "[deploy] Deployment verified successfully."
