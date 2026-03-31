import { Response } from "express";
import AuditLog from "../models/AuditLog";

export const getAuditLogs = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({ message: "Tenant ID introuvable" });
    }

    const { tenantId, role } = req.user;
    const { action, module, page = 1, limit = 50 } = req.query;

    const query: any = (role === "ADMIN" || role === "SUPER_ADMIN") ? {} : { tenantId };
    
    if (action) query.action = action;
    if (module) query.module = module;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await AuditLog.find(query)
      .populate("userId", "name email role avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: logs,
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    console.error("Audit Logs Error:", error);
    return res
      .status(500)
      .json({ message: "Erreur protocole audit", error: error.message });
  }
};

export const purgeAuditLogs = async (req: any, res: Response) => {
  try {
    const { tenantId, role } = req.user;
    
    // Global admins purge EVERYTHING, tenant admins purge their own
    const query = (role === "SUPER_ADMIN" || role === "ADMIN") ? {} : { tenantId };
    
    await AuditLog.deleteMany(query);
    
    return res.status(200).json({ success: true, message: "Forensic Ledger Purged" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
