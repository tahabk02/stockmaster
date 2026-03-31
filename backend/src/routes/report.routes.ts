import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Apply authMiddleware to all report routes
router.use(authMiddleware);

// مسار جلب الإحصائيات العامة
router.get("/stats", reportController.getGlobalStats);

// AI Chatbot endpoint
router.post("/ai/chat", reportController.chatWithAI);

// مسار توزيع الفئات (إذا كنتِ تستخدمينه)
router.get("/categories", reportController.getCategoryDistribution);

// Export Data Route
router.get("/export", reportController.exportData);

export default router;
