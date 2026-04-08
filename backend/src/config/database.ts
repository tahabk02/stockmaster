import mongoose from "mongoose";
import dotenv from "dotenv";
import Logger from "../utils/logger";

dotenv.config();

/**
 * Global cache for MongoDB connection to prevent leaks in serverless environments.
 */
let isConnected: boolean = false;

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    Logger.error("❌ MONGODB_URI is not defined in environment variables.");
    return;
  }

  // Use cached connection if available
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = db.connections[0].readyState === 1;
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
