import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", NotificationController.getAll);
router.get("/unread-count", NotificationController.getUnreadCount);
router.put("/mark-all-read", NotificationController.markAllAsRead);
router.put("/:id/read", NotificationController.markAsRead);
router.delete("/:id", NotificationController.delete);

export default router;
