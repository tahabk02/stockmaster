import { Router } from "express";
import { LogisticsController } from "../controllers/logistics.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// --- Fleet & Deliveries ---
router.get("/deliveries", LogisticsController.getAllDeliveries);
router.post("/deliveries", LogisticsController.createDelivery);
router.patch("/deliveries/:id/status", LogisticsController.updateDeliveryStatus);

// --- Layout & Inventory ---
router.get("/layout", LogisticsController.getLayout);
router.post("/layout", LogisticsController.saveLayout);
router.get("/restock-suggestions", LogisticsController.getRestockSuggestions);

export default router;
