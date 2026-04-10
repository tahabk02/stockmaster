import { ConnectionOptions } from "bullmq";
import { createClient } from "redis";
import { ENV } from "./env";
import Logger from "../utils/logger";

const REDIS_ENABLED = !!ENV.REDIS_URL && (ENV.NODE_ENV !== "development" || ENV.REDIS_URL !== "redis://localhost:6379");

/**
 * BullMQ Connection Options
 */
const getRedisConfig = (): ConnectionOptions => {
  // Try individual variables first, then fallback to URL
  const host = process.env.REDIS_HOST;
  const port = parseInt(process.env.REDIS_PORT || "6379");
  const password = process.env.REDIS_PASSWORD;

  if (host) {
    return {
      host,
      port,
      password,
      maxRetriesPerRequest: null,
    };
  }

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
  return ENV.REDIS_URL || "redis://localhost:6379";
};

export const redisClient = createClient(REDIS_ENABLED ? {
  url: getRedisUrl(),
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with a cap of 10 seconds
      if (retries > 5) return false; // Stop after 5 attempts if failing
      return Math.min(retries * 500, 10000);
    }
  }
} : undefined);

// Handle initial connection errors and runtime errors
if (REDIS_ENABLED) {
  redisClient.on("error", (err) => {
    Logger.error(`❌ Redis Error: ${err.message}`);
  });

  redisClient.on("connect", () => {
    Logger.info("⚡ Redis Connected Successfully");
  });

  redisClient.on("reconnecting", () => {
    Logger.warn("🔄 Redis Reconnecting...");
  });
}

// Non-blocking connection attempt
(async () => {
  if (!REDIS_ENABLED) {
    Logger.warn("⚠️ Redis is BYPASSED (No REDIS_URL or local dev without active redis).");
    return;
  }
  
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: any) {
    Logger.error(`❌ Initial Redis Connection Failed: ${error.message}`);
    Logger.warn("💡 App will continue without Redis features.");
  }
})();

export default redisClient;
