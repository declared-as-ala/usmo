# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# USM Web (Next.js) — production image, standalone output
# Build context: repo root (see docker-compose.prod.yml)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
COPY apps/web apps/web
COPY packages/shared packages/shared

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so this
# one must be a build ARG (not just a runtime env var like SITE_URL/INTERNAL_API_URL).
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Read by next.config.ts at build time to whitelist the production MinIO/API
# host for next/image — optional, only needed for a real production build.
ARG API_DOMAIN=
ARG MINIO_BUCKET=usm-media
ENV API_DOMAIN=$API_DOMAIN
ENV MINIO_BUCKET=$MINIO_BUCKET
RUN npm run build --workspace=web

# ── Runtime: only the standalone server + static assets (next.config.ts sets
#    output:'standalone' and outputFileTracingRoot so this is self-contained) ─
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --chown=node:node --from=build /app/apps/web/.next/standalone ./
COPY --chown=node:node --from=build /app/apps/web/.next/static apps/web/.next/static
COPY --chown=node:node --from=build /app/apps/web/public apps/web/public

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --spider --tries=1 http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
