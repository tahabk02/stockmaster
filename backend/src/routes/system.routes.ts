import { Router, Response } from "express";
import mongoose from "mongoose";
import os from "os";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/health", authMiddleware, async (req: any, res: Response) => {
  try {
    const start = Date.now();
    let dbLatency = "---";
    
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbLatency = `${Date.now() - start}ms`;
    }

    const healthData = {
      status: "optimal",
      uptime: process.uptime(),
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
        usage: Math.round((1 - os.freemem() / os.totalmem()) * 100)
      },
      cpu: {
        load: os.loadavg()[0].toFixed(2),
        cores: os.cpus().length
      },
      db: {
        status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        latency: dbLatency
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: healthData });
  } catch (error: any) {
    console.error("[System Health] Telemetry Error:", error);
    res.status(500).json({ success: false, message: "System Telemetry Failure", error: error.message });
  }
});

export default router;
