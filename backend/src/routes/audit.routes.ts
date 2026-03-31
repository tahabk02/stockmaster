import { Router } from "express";
import { getAuditLogs, purgeAuditLogs } from "../controllers/audit.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";

const router = Router();

// ✅ يجب أن يكون المسار هنا "/" فقط
router.get("/", authMiddleware, getAuditLogs);
router.delete("/purge", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]), purgeAuditLogs);

export default router;
