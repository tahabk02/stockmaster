import { Router } from "express";
import { StockController } from "../controllers/stock.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/adjust", StockController.adjust);
router.get("/movements", StockController.getMovements);
router.get("/stats/value", StockController.getStockValue);

export default router;
