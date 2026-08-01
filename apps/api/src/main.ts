import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Security Headers
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // CORS settings — CLIENT_URL may be a comma-separated list (e.g. localhost + LAN IP for phone testing)
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422,
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`[USM API] Backend server successfully listening on 0.0.0.0:${port}`);
}
bootstrap();
