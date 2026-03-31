import { Router } from "express";
import { ProductionController } from "../controllers/production.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/formulas", ProductionController.getFormulas);
router.post("/formulas", ProductionController.createFormula);
router.get("/orders", ProductionController.getOrders);
router.post("/orders", ProductionController.createOrder);
router.patch("/orders/:id/complete", ProductionController.completeOrder);

export default router;
