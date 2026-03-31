import { Request, Response } from "express";
import { mailQueue } from "../jobs/sendMail.job";
import { syncQueue } from "../jobs/syncStock.job";
import { addLowStockCheckJob } from "../jobs/alert.job";

export const getJobs = async (req: any, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    
    // In a real BullMQ setup, you would fetch job statuses.
    // Here we provide a registry-based simulation for the Ultra-Pro UI.
    const jobs = [
      {
        _id: "job_alert_stock",
        name: "Low Stock Alert Pulse",
        status: "QUEUED",
        interval: "Every 6 Hours",
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 2),
        logs: [{ timestamp: new Date(), message: "Scanning inventory lattice...", level: "INFO" }]
      },
      {
        _id: "job_sync_registry",
        name: "Cloud Registry Sync",
        status: "COMPLETED",
        interval: "Daily at 00:00",
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 14),
        logs: [{ timestamp: new Date(), message: "Handshake with global node successful.", level: "INFO" }]
      },
      {
        _id: "job_mail_dispatch",
        name: "Neural Mail Dispatcher",
        status: "RUNNING",
        interval: "Real-time Interception",
        nextRun: new Date(),
        logs: [
          { timestamp: new Date(), message: "Encrypting outgoing signal...", level: "INFO" },
          { timestamp: new Date(), message: "Signal ID: 0x442 dispatched.", level: "INFO" }
        ]
      }
    ];

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registry Access Denied" });
  }
};

export const runJob = async (req: any, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;

  try {
    if (id === "job_alert_stock") await addLowStockCheckJob(tenantId);
    else if (id === "job_sync_registry") await syncQueue.add("manual-sync", { tenantId });
    else if (id === "job_mail_dispatch") await mailQueue.add("manual-trigger", { tenantId });

    res.json({ success: true, message: "Signal Dispatched Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Signal Interrupted" });
  }
};

export const runAllJobs = async (req: any, res: Response) => {
  const tenantId = req.user?.tenantId;
  try {
    await Promise.all([
      addLowStockCheckJob(tenantId),
      syncQueue.add("manual-sync", { tenantId }),
      mailQueue.add("manual-trigger", { tenantId })
    ]);
    res.json({ success: true, message: "Global Lattice Synchronized" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Global Sync Failure" });
  }
};
