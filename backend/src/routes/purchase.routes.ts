import { Router } from "express";
import { PurchaseController } from "../controllers/purchase.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", PurchaseController.create);
router.get("/", PurchaseController.getAll);
router.get("/:id", PurchaseController.getById);
router.get("/supplier/:supplierId", PurchaseController.getBySupplier);

export default router;
