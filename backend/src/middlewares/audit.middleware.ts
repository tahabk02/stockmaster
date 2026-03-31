import { Request, Response, NextFunction } from "express";
import AuditLog from "../models/AuditLog";

/**
 * STOCKMASTER FORENSIC AUDIT PROTOCOL
 * Automatically intercepts and records all write operations across the commercial lattice.
 */
export const forensicAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl, body, user, tenantId } = req as any;

  // Only intercept write operations
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!writeMethods.includes(method)) return next();

  // Listen for the response to finish
  res.on("finish", async () => {
    // Only log successful operations or specific client errors
    if (res.statusCode >= 200 && res.statusCode < 400) {
      try {
        const action = `${method}_OPERATION`;
        const details = `Path: ${originalUrl} | Payload: ${JSON.stringify(body)} | Status: ${res.statusCode}`;

        // Ensure we have the necessary identifiers
        if (user && tenantId) {
          await AuditLog.create({
            userId: user._id,
            tenantId: tenantId,
            action: action,
            details: details,
            method: method, // We'll update the model to include method for higher bandwidth telemetry
          });
        }
      } catch (error) {
        console.error("CRITICAL_SYSTEM_ERROR: Forensic Registry Link Failed", error);
      }
    }
  });

  next();
};
