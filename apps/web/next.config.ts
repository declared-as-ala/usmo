import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Emits a self-contained apps/web/.next/standalone/ folder (server + only the
  // node_modules actually needed at runtime) — the production Dockerfile copies
  // just that instead of the full workspace node_modules.
  output: 'standalone',
  // Without this, Next.js's file tracer walks up looking for the workspace root
  // and (in this npm-workspaces monorepo) can escape past the repo entirely —
  // pin it explicitly to apps/web/../.. (the usmo/ repo root).
  outputFileTracingRoot: path.join(__dirname, '../..'),

  images: {
    remotePatterns: [
      // ── MinIO local development ────────────────────────────────────────────
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/usm-media/**',
      },
      // ── MinIO in production is reverse-proxied through the API domain
      //    (nginx routes https://$API_DOMAIN/$MINIO_BUCKET/* to MinIO — see
      //    deploy/nginx/templates/default.conf.template) — set API_DOMAIN as
      //    a build ARG so this doesn't require hardcoding a real hostname.
      ...(process.env.API_DOMAIN
        ? [{
            protocol: 'https' as const,
            hostname: process.env.API_DOMAIN,
            pathname: `/${process.env.MINIO_BUCKET || 'usm-media'}/**`,
          }]
        : []),

      // ── Unsplash (used in seed data; remove once real images are uploaded) ──
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },

      // ── Cloudinary / any future CDN ───────────────────────────────────────
      // {
      //   protocol: 'https',
      //   hostname: '**.cloudinary.com',
      // },
    ],
  },

  // Allow the Next.js dev server to accept connections from Docker network
  experimental: {},
};

export default nextConfig;
