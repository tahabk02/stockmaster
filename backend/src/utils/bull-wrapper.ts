import { Queue as BullQueue, Worker as BullWorker, Job, Processor } from "bullmq";
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

  constructor(name: string, options?: any) {
    this.name = name;
    if (SHOULD_USE_REDIS && !IS_VERCEL) {
      try {
        // Automatically inject connection if missing in options
        const queueOptions = {
          connection: redisConfig,
          ...options
        };
        
        this.queue = new BullQueue(name, queueOptions);
        
        this.queue.on('error', (err) => {
          Logger.error(`[Queue:${name}] Error: ${err.message}`);
        });
      } catch (err: any) {
        Logger.warn(`[Queue:${name}] Failed to initialize BullMQ: ${err.message}. Falling back to mock.`);
        this.queue = null;
      }
    }
  }

  async add(name: string, data: T, opts?: any): Promise<any> {
    if (this.queue) {
      try {
        return await this.queue.add(name as any, data as any, opts);
      } catch (err: any) {
        Logger.error(`[Queue:${this.name}] Failed to add job to Redis: ${err.message}.`);
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

  constructor(name: string, processor: Processor<T, R, N>, options?: any) {
    if (SHOULD_USE_REDIS && !IS_VERCEL) {
      try {
        // Automatically inject connection if missing in options
        const workerOptions = {
          connection: redisConfig,
          ...options
        };

        this.worker = new BullWorker(name, processor, workerOptions);

        this.worker.on('error', (err) => {
          Logger.error(`[Worker:${name}] Error: ${err.message}`);
        });
      } catch (err: any) {
        Logger.warn(`[Worker:${name}] Failed to initialize BullMQ Worker: ${err.message}.`);
      }
    }
  }
}
