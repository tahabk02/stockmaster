import { Job } from "bullmq";
import { redisConfig } from "../config/redis";
import Product from "../models/Product";
import { SafeQueue, SafeWorker } from "../utils/bull-wrapper";

// 1. التعريف بالـ Queue (Producer)
export const syncQueue = new SafeQueue("stock-sync");

// 2. دالة لإضافة مهمة مزامنة (تستدعى من الـ Controller)
export const addSyncJob = async (tenantId: string, data: any) => {
  await syncQueue.add(`sync-${tenantId}`, { tenantId, data }, { attempts: 2 });
};

// 3. الـ Worker (Consumer)
export const syncWorker = new SafeWorker(
  "stock-sync",
  async (job: Job) => {
    const { tenantId, data } = job.data;
    console.log(`🔄 Syncing started for Tenant: ${tenantId}`);

    for (const item of data) {
      await Product.updateOne(
        { tenantId, sku: item.sku },
        { $set: { quantity: item.quantity } }, // Fix: use "quantity"
      );
    }
  }
);
