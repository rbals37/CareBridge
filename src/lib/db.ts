import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 환경 변수를 확인해 주세요.",
    );
  }
  return uri;
}

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

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isServerless = process.env.VERCEL === "1";
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
      maxPoolSize: isServerless ? 1 : 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
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

export function isDbConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("mongoserverselectionerror") ||
    msg.includes("mongodb_uri") ||
    msg.includes("econnrefused") ||
    msg.includes("authentication failed") ||
    msg.includes("bad auth") ||
    msg.includes("timed out")
  );
}

export default connectDB;
