import { Router } from "express";
import { SupplierController } from "../controllers/supplier.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

/**
 * مسارات إدارة الموردين - /api/suppliers
 */

// جلب جميع الموردين
router.get("/", SupplierController.getAll);

// تصدير جميع المعاملات
router.get("/export-transactions", SupplierController.exportTransactions);

// فحص الفواتير المتأخرة
router.post("/check-overdue", SupplierController.checkOverdueInvoices);

// إنشاء مورد جديد
router.post("/", SupplierController.create);

// جلب مورد واحد بالتفصيل
router.get("/:id", SupplierController.getById);

// تحديث بيانات مورد
router.put("/:id", SupplierController.update);

// حذف مورد
router.delete("/:id", SupplierController.delete);

// تفعيل التحقق
router.patch("/:id/verify", SupplierController.verify);

// إجراءات جماعية
router.post("/bulk-action", SupplierController.bulkAction);

// --- Transactions / Cahier de charges ---
router.get("/:id/transactions", SupplierController.getTransactions);
router.get("/:id/stats", SupplierController.getStats);
router.post("/:id/transactions", SupplierController.addTransaction);
router.delete("/:suppId/transactions/:transId", SupplierController.deleteTransaction);

export default router;
