import { Request, Response, NextFunction } from "express";

export function roleMiddleware(requiredRoles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    // سطر ذهبي للتشخيص: انظري لشاشة السيرفر عند طلب المنتجات
    console.log("🔍 [Debug] User object in request:", req.user);

    if (!req.user || !req.user.role) {
      console.error("❌ [Error] Role not found in req.user");
      return res.status(403).json({
        message: "Accès interdit : Rôle utilisateur introuvable dans le token.",
      });
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedRoles = requiredRoles.map((role) => role.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      console.error(
        `❌ [Error] Forbidden: Role ${userRole} not in ${normalizedRoles}`,
      );
      return res.status(403).json({
        message:
          "Accès interdit : Vous n'avez pas les permissions nécessaires.",
      });
    }

    next();
  };
}
