import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/chat", authMiddleware, AIController.chat);
router.post("/diagnose", authMiddleware, AIController.diagnoseProduct);
router.get("/insights", authMiddleware, AIController.getInsights);

export default router;
