import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";

const router = Router();

// Only Super Admins or Admins can access these
router.use(authMiddleware);
router.use(roleMiddleware([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

router.get("/stats", AdminController.getStats);
router.get("/tenants", AdminController.getAllTenants);
router.patch("/tenants/:id", AdminController.updateTenant);
router.delete("/tenants/:id", AdminController.deleteTenant);
router.patch("/tenants/:id/status", AdminController.updateTenantStatus);

router.get("/users", AdminController.getAllUsers);
router.delete("/users/:id", AdminController.deleteUser);

export default router;
