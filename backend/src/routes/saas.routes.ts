import { Router } from "express";
import { SaaSController } from "../controllers/saas.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";
import { subscriptionGuard } from "../middlewares/subscriptionGuard"; // Import subscriptionGuard

const router = Router();

// Routes réservées aux Super Admins (pour la gestion globale)
router.use(authMiddleware);
router.use(roleMiddleware([UserRole.SUPER_ADMIN])); // Apply to Super Admins only
router.get("/tenants", SaaSController.getAllTenants);
router.put("/tenants/:id/plan", SaaSController.updateTenantPlan);
router.get("/stats", SaaSController.getGlobalStats);

// Routes pour l'utilisateur lambda (pour s'abonner)
// These routes are not role-protected by SUPER_ADMIN, only authMiddleware.
router.post("/create-checkout-session", authMiddleware, SaaSController.createCheckoutSession);
router.post("/create-payment-intent", authMiddleware, SaaSController.createPaymentIntent);

export default router;
