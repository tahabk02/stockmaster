import { Router } from "express";
import { diagnoseProduct, getInsights, getSupplyChainStatus, chat, vision } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/diagnose", authMiddleware, diagnoseProduct);
router.get("/insights", authMiddleware, getInsights);
router.get("/supply", authMiddleware, getSupplyChainStatus);
router.post("/chat", authMiddleware, chat);
router.post("/vision", authMiddleware, vision);

export default router;
