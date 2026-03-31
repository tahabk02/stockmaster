import { Router } from "express";
import { LegalController } from "../controllers/legal.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @route   POST /api/legal/ask
 * @desc    Ask the Moroccan Legal & Tax Advisor
 * @access  Private
 */
router.post("/ask", authMiddleware, LegalController.askConsultant);

/**
 * @route   GET /api/legal/health
 * @desc    Get Legal Health HUD status
 * @access  Private
 */
router.get("/health", authMiddleware, LegalController.getLegalHealth);

export default router;
