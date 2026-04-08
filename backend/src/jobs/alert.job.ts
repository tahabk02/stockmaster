import { Job } from "bullmq";
import Product from "../models/Product";
import { SafeQueue, SafeWorker } from "../utils/bull-wrapper";

const QUEUE_NAME = "inventory-alerts";

export const inventoryQueue = new SafeQueue(QUEUE_NAME);

/**
 * دالة إضافة مهمة فحص المخزون للطابور
 */
export const addLowStockCheckJob = async (tenantId: string) => {
  await inventoryQueue.add(
    `check-stock-${tenantId}`,
    { tenantId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
    },
  );
};

export const inventoryWorker = new SafeWorker(
  QUEUE_NAME,
  async (job: Job) => {
    const { tenantId } = job.data;

    console.log(`[Job ${job.id}] 🔍 Checking inventory for Tenant: ${tenantId}`);

    const lowStockItems = await Product.find({
      tenantId,
      $expr: { $lte: ["$quantity", "$minStockThreshold"] },
    });

    if (lowStockItems.length === 0) {
      console.log(`[Job ${job.id}] ✅ Stock levels are healthy.`);
      return;
    }

    console.log(`[Job ${job.id}] ⚠️ Found ${lowStockItems.length} low stock items.`);
  }
);
