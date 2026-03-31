import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", DocumentController.getAll);
router.post("/", DocumentController.create);
router.delete("/:id", DocumentController.delete);

export default router;
