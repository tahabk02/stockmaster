import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware";
import { UserRole } from "../enums/UserRole";
import { subscriptionGuard, checkProductLimit } from "../middlewares/subscriptionGuard";

const router = Router();

// Get all products (for authenticated users)
router.get("/", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR, UserRole.USER]), ProductController.getAll);

// Get single product
router.get("/:id", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR, UserRole.USER]), ProductController.getById);

// Create a new product (Admins, Super Admins and Vendors)
router.post(
  "/",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR]),
  subscriptionGuard,
  checkProductLimit,
  ProductController.create,
);

// Sync products (for authenticated users)
router.post(
  "/sync",
  authMiddleware,
  ProductController.syncProducts,
);

router.get("/:id/stats", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR]), ProductController.getProductStats);

// Add internal comment
router.post("/:id/comments", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR]), ProductController.addComment);

// Update a product
router.put("/:id", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR]), ProductController.update);

// Delete a product
router.delete("/:id", authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VENDOR]), ProductController.delete);

export default router;
