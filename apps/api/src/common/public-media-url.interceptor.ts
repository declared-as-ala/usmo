import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { normalizePublicMediaUrls, PublicMediaUrlOptions } from './public-media-url';

@Injectable()
export class PublicMediaUrlInterceptor implements NestInterceptor {
  private readonly options: PublicMediaUrlOptions = {
    bucket: process.env.MINIO_BUCKET,
    publicUrl: process.env.MINIO_PUBLIC_URL,
    minioEndpoint: process.env.MINIO_ENDPOINT,
    nodeEnv: process.env.NODE_ENV,
  };

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((response) => normalizePublicMediaUrls(response, this.options)));
  }
}
