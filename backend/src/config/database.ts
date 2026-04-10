import mongoose from "mongoose";
import Logger from "../utils/logger";
import { ENV } from "./env";

// 1. Déclarer l-interface dial l-cache f global
interface MongooseCache {
  conn: any;
  promise: any;
}

declare global {
  var mongooseCache: MongooseCache;
}

// 2. Initialize l-cache f l-objet global
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDatabase() {
  const uri = ENV.DATABASE_URL;

  if (!uri) {
    Logger.error("❌ DATABASE_URL (MONGODB_URI or MONGO_URI) is not defined.");
    return null;
  }

  // Extract DB Name for logging
  let dbName = "unknown";
  try {
    const urlParts = uri.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    dbName = lastPart.split("?")[0] || "stockmaster";
  } catch (e) {
    dbName = "stockmaster";
  }

  // Si déjà connecté, return l-connection
  if (cached.conn) {
    return cached.conn;
  }

  // Si ma-khdamach l-connection, n-creer-ha
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Zid l-waqt chwiya l-vercel
      dbName: "stockmaster", // Explicit target override
    };

    Logger.info(`🚀 PROTOCOL 9.2: Data Source targeted at [${dbName}]`);
    Logger.info(`🔄 Connecting to MongoDB [${dbName}]...`);
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    Logger.info(`✅ Connected to MongoDB: [${dbName}] (Persistent)`);
  } catch (e: any) {
    cached.promise = null; // Reset l-promise f halat l-ghalat
    Logger.error("❌ MongoDB Connection Error: " + e.message);

    // Debug specific l-Vercel
    if (e.message.includes("selection timeout")) {
      Logger.error(
        "💡 Tip: Check if MongoDB Atlas IP Whitelist allows 0.0.0.0/0",
      );
    }

    return null;
  }

  return cached.conn;
}
