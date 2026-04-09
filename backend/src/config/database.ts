import mongoose from "mongoose";
import Logger from "../utils/logger";
import { ENV } from "./env";

/**
 * Global cache for MongoDB connection to prevent leaks in serverless environments.
 */
let cachedConnection: any = null;

export async function connectDatabase() {
  const uri = ENV.MONGODB_URI;

  if (!uri) {
    Logger.error("❌ MONGODB_URI is not defined in environment variables.");
    return;
  }

  // Use cached connection if available and state is connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Recommended for serverless
    });
    
    cachedConnection = db;
    Logger.info("✅ Connected to MongoDB Atlas (Cached)");
    return db;
  } catch (error: any) {
    Logger.error("❌ MongoDB Connection Error: " + error.message);
    // Don't exit process in serverless, let the function retry
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
}
