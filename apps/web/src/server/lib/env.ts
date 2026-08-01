import { z } from 'zod';

/**
 * Server-only environment access. Validated once, fails fast with the names of
 * the missing variables instead of failing deep inside a request.
 * Never import this file from client components.
 */
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required (see .env.example)'),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET is required (openssl rand -base64 32)'),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(10).optional(),
  MAIL_FROM: z.string().optional(),
  SMTP_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n  ');
    throw new Error(`Invalid environment configuration:\n  ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
