import { ConnectionOptions } from "bullmq";
import { createClient } from "redis";
import { ENV } from "./env";
import Logger from "../utils/logger";

const REDIS_ENABLED = ENV.NODE_ENV !== "development" || !!ENV.REDIS_URL;

/**
 * BullMQ Connection Options
 */
const getRedisConfig = () => {
  const url = ENV.REDIS_URL || "redis://localhost:6379";
  const normalizedUrl = url.includes("://") ? url : `redis://${url}`;
  
  try {
    const parsed = new URL(normalizedUrl);
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      maxRetriesPerRequest: null,
    };
  } catch (e) {
    if (REDIS_ENABLED) {
      Logger.warn("⚠️ Invalid REDIS_URL format, falling back to defaults.");
    }
    return {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

export const redisConfig: ConnectionOptions = getRedisConfig();

/**
 * General Purpose Redis Client (redis v4+)
 */
const getRedisUrl = () => {
  const url = ENV.REDIS_URL || "redis://localhost:6379";
  return url.includes("://") ? url : `redis://${url}`;
};

export const redisClient = createClient({
  url: getRedisUrl(),
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with a cap of 10 seconds, but only if REDIS_ENABLED
      if (!REDIS_ENABLED && retries > 2) return false; // Stop trying quickly in dev if it fails
      return Math.min(retries * 500, 10000);
    }
  }
});

// Handle initial connection errors and runtime errors
redisClient.on("error", (err) => {
  if (REDIS_ENABLED) {
    Logger.error(`❌ Redis Error: ${err.message}`);
  }
});

redisClient.on("connect", () => {
  Logger.info("⚡ Redis Connected Successfully");
});

redisClient.on("reconnecting", () => {
  if (REDIS_ENABLED) {
    Logger.warn("🔄 Redis Reconnecting...");
  }
});

// Non-blocking connection attempt
(async () => {
  if (!REDIS_ENABLED) {
    Logger.warn("⚠️ Redis is disabled or missing in development. Mocking operations.");
    return;
  }
  
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: any) {
    Logger.error(`❌ Initial Redis Connection Failed: ${error.message}`);
  }
})();

export default redisClient;
