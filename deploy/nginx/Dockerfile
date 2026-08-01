FROM nginx:1.27-alpine

ENV MINIO_BUCKET=usm-media \
    NGINX_CLIENT_MAX_BODY_SIZE=350m \
    NGINX_HTTPS_MODE=auto \
    NGINX_SERVER_NAMES=_

COPY deploy/nginx/templates/ /etc/nginx/source-templates/
COPY --chmod=0755 deploy/nginx/docker-entrypoint.d/15-select-config.sh /docker-entrypoint.d/15-select-config.sh
