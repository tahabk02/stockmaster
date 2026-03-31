import { Request, Response, NextFunction } from "express";

// تمديد تعريف الـ Request ليشمل الـ tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. استخراج الـ Tenant ID من الـ Headers (مثلاً: x-tenant-id)
  const tenantId = req.headers["x-tenant-id"] as string;

  // 2. التحقق من وجوده (إجباري في العمليات الحساسة)
  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message: "Tenant ID is missing. Please provide X-Tenant-ID header.",
    });
  }

  // 3. حقن الـ ID في الـ request لاستخدامه في الـ Controller والـ Service
  req.tenantId = tenantId;

  next();
};
