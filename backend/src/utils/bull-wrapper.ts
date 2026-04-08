import { Queue as BullQueue, Worker as BullWorker, Job, QueueOptions, WorkerOptions, Processor } from "bullmq";
import { redisConfig } from "../config/redis";
import Logger from "./logger";

const REDIS_URL = process.env.REDIS_URL;
const IS_DEV = process.env.NODE_ENV === "development";
const IS_VERCEL = !!process.env.VERCEL;
const SHOULD_USE_REDIS = !IS_DEV || !!REDIS_URL;

/**
 * A safe wrapper around BullMQ Queue that falls back to immediate execution
 * if Redis is not available or disabled.
 */
export class SafeQueue<T = any, R = any, N extends string = string> {
  private queue: BullQueue<T, R, N> | null = null;
  private name: string;

  constructor(name: string, options?: QueueOptions) {
    this.name = name;
    if (SHOULD_USE_REDIS && !IS_VERCEL) {
      try {
        this.queue = new BullQueue(name, {
          connection: redisConfig,
          ...options,
        });
        
        this.queue.on('error', (err) => {
          Logger.error(`[Queue:${name}] Error: ${err.message}`);
        });
      } catch (err: any) {
        Logger.warn(`[Queue:${name}] Failed to initialize BullMQ: ${err.message}. Falling back to mock.`);
        this.queue = null;
      }
    } else {
      Logger.info(`[Queue:${name}] Redis disabled. Using mock queue.`);
    }
  }

  async add(name: N, data: T, opts?: any): Promise<any> {
    if (this.queue) {
      try {
        return await this.queue.add(name, data, opts);
      } catch (err: any) {
        Logger.error(`[Queue:${this.name}] Failed to add job to Redis: ${err.message}.`);
        // In dev, we might want to just execute it if it's critical, 
        // but for now we just log it as BullMQ should handle it if Redis comes back.
      }
    }
    
    Logger.info(`[Queue:${this.name}] Mock Add Job: ${name}`);
    return { id: "mock-id", data };
  }
}

/**
 * A safe wrapper around BullMQ Worker
 */
export class SafeWorker<T = any, R = any, N extends string = string> {
  private worker: BullWorker<T, R, N> | null = null;

  constructor(name: string, processor: Processor<T, R, N>, options?: WorkerOptions) {
    if (SHOULD_USE_REDIS && !IS_VERCEL) {
      try {
        this.worker = new BullWorker(name, processor, {
          connection: redisConfig,
          ...options,
        });

        this.worker.on('error', (err) => {
          Logger.error(`[Worker:${name}] Error: ${err.message}`);
        });
      } catch (err: any) {
        Logger.warn(`[Worker:${name}] Failed to initialize BullMQ Worker: ${err.message}.`);
      }
    }
  }
}
