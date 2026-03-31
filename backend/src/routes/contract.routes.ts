import { Router } from "express";
import { ContractController } from "../controllers/contract.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", ContractController.getAll);
router.post("/", ContractController.create);
router.get("/stats", ContractController.getStats);
router.patch("/:id/status", ContractController.updateStatus);

export default router;
