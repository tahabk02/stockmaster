import AuditLog from "../models/AuditLog";

export enum AuditAction {
  // Asset Management
  ASSET_CREATED = "ASSET_CREATED",
  ASSET_UPDATED = "ASSET_UPDATED",
  ASSET_DELETED = "ASSET_DELETED",
  
  // Transaction Protocol
  TRX_COMMITTED = "TRX_COMMITTED",
  TRX_CANCELED = "TRX_CANCELED",
  
  // Node Orchestration
  NODE_SUSPENDED = "NODE_SUSPENDED",
  NODE_INITIALIZED = "NODE_INITIALIZED",
  QUOTA_REALLOCATED = "QUOTA_REALLOCATED",
  
  // Access Control
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  AGENT_ONBOARDED = "AGENT_ONBOARDED",
  AGENT_REMOVED = "AGENT_REMOVED",
  PERMISSION_OVERRIDE = "PERMISSION_OVERRIDE",
  
  // Fiscal Intelligence
  MANIFEST_ACCESSED = "MANIFEST_ACCESSED"
}

export class AuditService {
  /**
   * Universal Signal Recording Protocol
   */
  static async log(
    tenantId: string,
    userId: string,
    action: AuditAction,
    details: string,
    metadata: any = {}
  ) {
    try {
      await AuditLog.create({
        tenantId,
        userId,
        action,
        details,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          signature: `SIG-${Math.random().toString(36).substring(7).toUpperCase()}`
        }
      });
      console.log(`[Forensic] Signal Recorded: ${action} for Node ${tenantId}`);
    } catch (error) {
      console.error("[Forensic] Registry Write Failure:", error);
    }
  }
}
