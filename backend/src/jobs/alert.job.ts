import { Queue, Worker, Job } from "bullmq";
import { redisConfig } from "../config/redis";
import Product from "../models/Product";
import User from "../models/User";
import { NotificationService } from "../services/notification.service";
import { NotificationType } from "../models/Notification";
import { addMailJob } from "./sendMail.job";

const QUEUE_NAME = "inventory-alerts";

export const inventoryQueue = new Queue(QUEUE_NAME, {
  connection: redisConfig,
});

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

export const inventoryWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { tenantId } = job.data;

    console.log(`[Job ${job.id}] 🔍 Checking inventory for Tenant: ${tenantId}`);

    // Fix: use "quantity" instead of "stockQuantity"
    const lowStockItems = await Product.find({
      tenantId,
      $expr: { $lte: ["$quantity", "$minStockThreshold"] },
    });

    if (lowStockItems.length === 0) {
      console.log(`[Job ${job.id}] ✅ Stock levels are healthy.`);
      return;
    }

    // Create System Notifications for low stock
    for (const item of lowStockItems) {
      await NotificationService.notifyAdmins(
        tenantId,
        "Alerte de Stock",
        `Le produit ${item.name} est à un niveau critique (${item.quantity} unités).`,
        NotificationType.STOCK_ALERT
      );
    }

    // Send consolidated Email to Admin
    const admin = await User.findOne({ tenantId, role: "ADMIN" });

    if (admin && admin.email) {
      const productListHtml = lowStockItems
        .map(
          (p) =>
            `<li><strong>${p.name}</strong>: ${p.quantity} restants (Seuil: ${p.minStockThreshold})</li>`,
        )
        .join("");

      const emailContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #ef4444;">⚠️ Alerte de Stock Bas</h2>
          <p>Les articles suivants nécessitent votre attention :</p>
          <ul>${productListHtml}</ul>
          <p>Connectez-vous à votre interface pour passer commande.</p>
        </div>
      `;

      await addMailJob(
        admin.email,
        "⚠️ Alerte de Stock Bas - StockMaster Pro",
        emailContent,
      );
    }
  },
  { connection: redisConfig },
);

inventoryWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} has completed successfully.`);
});

inventoryWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error: ${err.message}`);
});
