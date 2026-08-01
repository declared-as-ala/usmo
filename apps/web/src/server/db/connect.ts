import mongoose from 'mongoose';
import { getEnv } from '../lib/env';

/**
 * Cached mongoose connection, safe for serverless / Next.js dev HMR:
 * the promise lives on globalThis so hot reloads and concurrent requests
 * reuse one connection instead of piling up.
 */
const globalStore = globalThis as unknown as {
  __usmMongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached = (globalStore.__usmMongoose ??= { conn: null, promise: null });

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const { MONGODB_URI } = getEnv();
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry after a failed connect
    throw err;
  }
  return cached.conn;
}
