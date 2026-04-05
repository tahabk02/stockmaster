import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../enums/UserRole";
import { ENV } from "../config/env";

export interface AuthRequest extends Request {}

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token manquant." });

  try {
    const decoded: any = jwt.verify(
      token,
      ENV.JWT_SECRET || "your_secret_key",
    );

    // تأكد أن الـ decoded يحتوي على الـ tenantId و الـ role
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expirée ou invalide." });
  }
};

// 2. تطوير الـ roleMiddleware ليكون أكثر مرونة
export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Accès refusé: Rôle manquant." });
    }

    const userRole = req.user.role as UserRole;

    // ✅ منطق الصلاحيات:
    // - الـ SUPER_ADMIN و ADMIN كيدوزو لكلشي (Full Access)
    // - الأدوار الأخرى (VENDOR, USER, STAFF) خاصها تكون فـ القائمة المسموحة
    const hasAccess =
      userRole === UserRole.SUPER_ADMIN ||
      userRole === UserRole.ADMIN ||
      allowedRoles.includes(userRole);

    if (hasAccess) {
      return next();
    }

    return res.status(403).json({
      message: `Accès interdit: Votre rôle (${userRole}) n'a pas les permissions nécessaires.`,
    });
  };
};

// 3. (إضافة احترافية) ميدل وير للتحقق من الـ Tenant
export const tenantGuard = (req: any, res: Response, next: NextFunction) => {
  if (
    req.user.role === UserRole.SUPER_ADMIN ||
    req.user.role === UserRole.ADMIN
  ) {
    return next(); // الأدمن كيشوف كلشي
  }

  // إذا كان بائع، كنضيفو الـ tenantId للـ query تلقائياً باش السيرفر يفلتر السلعة
  if (req.user.tenantId) {
    req.query.tenantId = req.user.tenantId;
    return next();
  }

  return res.status(403).json({ message: "Accès refusé: Tenant ID manquant." });
};
