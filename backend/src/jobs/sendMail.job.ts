import { Queue, Worker, Job } from "bullmq";
import { redisConfig } from "../config/redis";
import { sendEmail } from "../services/mail.service";

export const mailQueue = new Queue("mail-queue", { 
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  }
});

/**
 * Add an email job to the queue
 */
export const addMailJob = async (to: string, subject: string, html: string) => {
  try {
    await mailQueue.add("send-email", { to, subject, html });
    console.log(`[Queue] Added mail job for ${to}`);
  } catch (error) {
    console.error("[Queue] Error adding mail job:", error);
  }
};

/**
 * Process the mail queue
 */
export const mailWorker = new Worker(
  "mail-queue",
  async (job: Job) => {
    const { to, subject, html } = job.data;
    try {
      console.log(`[Worker] Processing mail job ${job.id} for ${to}`);
      await sendEmail(to, subject, html);
    } catch (error) {
      console.error(`[Worker] Failed to send email to ${to}:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  { connection: redisConfig },
);
