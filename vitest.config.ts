import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
    },
  },
  test: {
    environment: 'node',
    include: ['apps/web/src/**/__tests__/**/*.test.ts'],
  },
});
