import { Router } from "express";
import { getCurrentTenant, updateCurrentTenant } from "../controllers/tenant.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";

const router = Router();

// Get current tenant settings
router.get("/", authMiddleware, getCurrentTenant);

// Update current tenant settings (Admins and Vendors)
router.put(
    "/",
    authMiddleware,
    roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR]),
    updateCurrentTenant
);

export default router;
