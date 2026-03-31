import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// 1. مسارات المزامنة (تأكد أنها مطابقة لـ Sales.tsx)
router.get("/mobile-pending", authMiddleware, OrderController.getMobilePending);
router.post(
  "/sync-from-mobile",
  authMiddleware,
  OrderController.syncMobileOrder,
);

// 2. مسارات الـ POS العادية
router.post("/", authMiddleware, OrderController.create);
router.get("/", authMiddleware, OrderController.getAll);
router.get("/stats", authMiddleware, OrderController.getStats);
router.get("/:id", authMiddleware, OrderController.getById);
router.get("/:id/invoice", authMiddleware, OrderController.downloadInvoice);

export default router;
