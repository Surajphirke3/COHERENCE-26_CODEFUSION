// src/lib/db.ts
import mongoose from "mongoose";

/**
 * Global cache to prevent multiple connections during hot-reload in development.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using a singleton pattern.
 * Caches the connection in the Node.js global object to prevent
 * connection leaks during Next.js hot-reloads in development.
 *
 * @returns The active Mongoose connection instance
 * @throws Error if MONGODB_URI environment variable is not set
 */
export default async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "❌ MONGODB_URI is not defined. Please add it to your .env file."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ MongoDB connected successfully");
      }
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
