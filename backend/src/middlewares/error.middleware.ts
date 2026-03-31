import { Request, Response, NextFunction } from "express";
import Logger from "../utils/logger";

/**
 * SOVEREIGN DIAGNOSTIC PROTOCOL
 * Standardizes all system failures into high-bandwidth diagnostic signals.
 * Aligned with STOCKMASTER GLOBAL PROTOCOL : ENGINEERING MANDATES.
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const diagnosticCode = err.code || "CORE_LATTICE_FAILURE";

  // Forensic Log of the failure
  Logger.error(`[DIAG_SIGNAL] ${diagnosticCode} | ${statusCode} | ${err.message} | ${req.originalUrl}`);
  
  if (process.env.NODE_ENV === "development") {
    console.error("💥 SYSTEM_CRASH_TRACE:", err);
  }

  res.status(statusCode).json({
    success: false,
    status: status,
    signal: {
      code: diagnosticCode,
      message: err.message || "Unknown_Node_Conflict",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      node: process.env.NODE_ID || "AXIS_PRIMARY"
    },
    // Only reveal stack in dev mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
