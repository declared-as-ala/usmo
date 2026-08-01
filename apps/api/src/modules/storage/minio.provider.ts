import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

export const MINIO_CLIENT = 'MINIO_CLIENT';

/**
 * Provides a configured MinIO client instance.
 * Reads all connection parameters from environment variables.
 * The bucket is created (if missing) and a public-read policy is applied on startup.
 */
export const minioProvider = {
  provide: MINIO_CLIENT,
  inject: [ConfigService],
  useFactory: async (config: ConfigService): Promise<Client> => {
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(config.get<string>('MINIO_PORT', '9000'));
    const useSSL = config.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = config.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = config.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    const bucket = config.get<string>('MINIO_BUCKET', 'usm-media');

    const client = new Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    // Ensure bucket exists
    try {
      const exists = await client.bucketExists(bucket);
      if (!exists) {
        await client.makeBucket(bucket);
        console.log(`[MinIO] Created bucket: ${bucket}`);
      }

      // Apply public-read policy so assets are accessible via direct URL
      const publicPolicy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      });

      await client.setBucketPolicy(bucket, publicPolicy);
      console.log(`[MinIO] Public-read policy applied to bucket: ${bucket}`);
    } catch (err) {
      // Do not crash the app if MinIO is temporarily unavailable (e.g. first boot race)
      console.warn(`[MinIO] Warning: Could not initialize bucket "${bucket}":`, (err as Error).message);
    }

    return client;
  },
};
