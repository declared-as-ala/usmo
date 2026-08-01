import { z } from 'zod';

const commaSeparatedUrls = z.string().min(1).superRefine((value, context) => {
  for (const origin of value.split(',').map((item) => item.trim()).filter(Boolean)) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('unsupported protocol');
      }
    } catch {
      context.addIssue({
        code: 'custom',
        message: 'must contain only comma-separated HTTP(S) origins',
      });
      return;
    }
  }
});

const publicMediaUrl = z.string().min(1).refine((value) => {
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}, 'must be a root-relative path or an HTTP(S) URL');

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//, 'must be a MongoDB URI'),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  CLIENT_URL: commaSeparatedUrls.default('http://localhost:3000'),
  MINIO_ENDPOINT: z.string().min(1).refine(
    (value) => !value.includes('://') && !value.includes('/'),
    'must be a hostname without a scheme or path',
  ),
  MINIO_PORT: z.coerce.number().int().min(1).max(65535).default(9000),
  MINIO_USE_SSL: z.enum(['true', 'false']).default('false'),
  MINIO_ACCESS_KEY: z.string().min(3),
  MINIO_SECRET_KEY: z.string().min(8),
  MINIO_BUCKET: z.string().regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/),
  MINIO_PUBLIC_URL: publicMediaUrl,
});

export function validateEnvironment(config: Record<string, unknown>) {
  const result = environmentSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid application environment: ${details}`);
  }
  return { ...config, ...result.data };
}
