import { Router } from "express";
import { ReturnController } from "../controllers/return.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", ReturnController.getAll);
router.post("/", ReturnController.createReturn);
router.patch("/:id/status", ReturnController.updateStatus);

export default router;
