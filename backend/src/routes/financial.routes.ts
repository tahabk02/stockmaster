import { Router } from "express";
import { FinancialController } from "../controllers/financial.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/sync", FinancialController.syncCurrentMonth);
router.get("/history", FinancialController.getHistory);

export default router;
