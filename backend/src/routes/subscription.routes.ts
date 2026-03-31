import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";

const router = Router();

// Middleware for all subscription routes (authentication)
router.use(authMiddleware);

// Subscription Plans (Admin/Super Admin only for creation/update/deletion)
router.get("/plans", SubscriptionController.getAllSubscriptionPlans);
router.get("/plans/:id", SubscriptionController.getSubscriptionPlanById);
router.post(
  "/plans",
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  SubscriptionController.createSubscriptionPlan
);
router.put(
  "/plans/:id",
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  SubscriptionController.updateSubscriptionPlan
);
router.delete(
  "/plans/:id",
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  SubscriptionController.deleteSubscriptionPlan
);

// Subscriptions (User/Client specific or Admin controlled)
router.get("/", SubscriptionController.getAllSubscriptions);
router.get("/:id", SubscriptionController.getSubscriptionById);
router.post("/", SubscriptionController.createSubscription);
router.put(
  "/:id",
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]), // Only admins can update general subscription details
  SubscriptionController.updateSubscription
);
router.patch(
  "/:id/cancel",
  SubscriptionController.cancelSubscription // Allow users to cancel their own subscriptions
);


export default router;
