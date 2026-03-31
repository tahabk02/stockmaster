import { Router } from "express";
import { QualityController } from "../controllers/quality.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/history", QualityController.getHistory);
router.post("/record", QualityController.record);
router.get("/product/:id", QualityController.getProductInsights);

export default router;
