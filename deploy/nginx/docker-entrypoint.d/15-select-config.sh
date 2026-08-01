#!/bin/sh
set -eu

source_dir=/etc/nginx/source-templates
target_file=/etc/nginx/conf.d/default.conf

is_hostname() {
    value=$1
    [ -n "$value" ] || return 1
    [ ${#value} -le 253 ] || return 1
    printf '%s\n' "$value" | grep -Eq '^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)*[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$'
}

valid_app=false
valid_api=false
if is_hostname "${APP_DOMAIN:-}"; then valid_app=true; fi
if is_hostname "${API_DOMAIN:-}"; then valid_api=true; fi

names=${NGINX_SERVER_NAMES:-_}
if [ "$names" = "_" ]; then
    if [ "$valid_app" = true ]; then names=$APP_DOMAIN; fi
    if [ "$valid_api" = true ] && [ "${API_DOMAIN:-}" != "${APP_DOMAIN:-}" ]; then
        if [ "$names" = "_" ]; then names=$API_DOMAIN; else names="$names $API_DOMAIN"; fi
    fi
fi

safe_names=
for name in $names; do
    if [ "$name" = "_" ] || is_hostname "$name"; then
        safe_names="${safe_names:+$safe_names }$name"
    else
        echo "[nginx-config] WARNING: ignoring an invalid server name; hostnames must not contain schemes, commas, quotes, or semicolons." >&2
    fi
done
NGINX_SERVER_NAMES=${safe_names:-_}
export NGINX_SERVER_NAMES

case "${MINIO_BUCKET:-}" in
    ''|*[!a-z0-9.-]*|.*|*.)
        echo "[nginx-config] WARNING: invalid or missing MINIO_BUCKET; using usm-media." >&2
        MINIO_BUCKET=usm-media
        export MINIO_BUCKET
        ;;
esac

upload_limit=${NGINX_CLIENT_MAX_BODY_SIZE:-}
case "$upload_limit" in
    *[kKmMgG]) upload_limit_number=${upload_limit%?} ;;
    *) upload_limit_number=$upload_limit ;;
esac
case "$upload_limit_number" in
    ''|*[!0-9]*)
        echo "[nginx-config] WARNING: invalid upload limit; using 350m." >&2
        NGINX_CLIENT_MAX_BODY_SIZE=350m
        export NGINX_CLIENT_MAX_BODY_SIZE
        ;;
esac

mode=${NGINX_HTTPS_MODE:-auto}
case "$mode" in auto|off|required) ;; *)
    echo "[nginx-config] ERROR: NGINX_HTTPS_MODE must be auto, off, or required." >&2
    exit 1
esac

template=default.conf.template
if [ "$mode" != off ] && [ "$valid_app" = true ] && [ "$valid_api" = true ]; then
    app_cert=/etc/letsencrypt/live/$APP_DOMAIN
    api_cert=/etc/letsencrypt/live/$API_DOMAIN
    if [ "$APP_DOMAIN" = "$API_DOMAIN" ] && [ -s "$app_cert/fullchain.pem" ] && [ -s "$app_cert/privkey.pem" ]; then
        template=https-single.conf.template
    elif [ "$APP_DOMAIN" != "$API_DOMAIN" ] && [ -s "$app_cert/fullchain.pem" ] && [ -s "$app_cert/privkey.pem" ] && [ -s "$api_cert/fullchain.pem" ] && [ -s "$api_cert/privkey.pem" ]; then
        template=https-split.conf.template
    fi
fi

if [ "$mode" = required ] && [ "$template" = default.conf.template ]; then
    echo "[nginx-config] ERROR: HTTPS is required but valid domains and certificate files were not found." >&2
    exit 1
fi

envsubst '${APP_DOMAIN} ${API_DOMAIN} ${NGINX_SERVER_NAMES} ${MINIO_BUCKET} ${NGINX_CLIENT_MAX_BODY_SIZE}' \
    < "$source_dir/$template" > "$target_file"
echo "[nginx-config] Selected $template with server_name $NGINX_SERVER_NAMES"
