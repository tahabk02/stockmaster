import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", ExpenseController.getAll);
router.post("/", ExpenseController.create);
router.get("/stats", ExpenseController.getStats);
router.get("/:id/receipt", ExpenseController.downloadReceipt);
router.delete("/:id", ExpenseController.delete);

export default router;
