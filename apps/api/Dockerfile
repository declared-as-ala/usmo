# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# USM API (NestJS) — production image
# Build context: repo root (see docker-compose.prod.yml)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install full deps + compile ─────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
COPY apps/api apps/api
COPY packages/shared packages/shared
RUN npm run build --workspace=api

# ── Stage 2: install production-only deps (no @nestjs/cli, typescript, etc.) ─
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --omit=dev

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --chown=node:node --from=prod-deps /app/node_modules node_modules
COPY --chown=node:node --from=build /app/apps/api/dist apps/api/dist
COPY --chown=node:node --from=build /app/packages/shared packages/shared

# node:22-alpine ships a non-root "node" user (uid/gid 1000) — own the app dir.
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --spider --tries=1 http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
