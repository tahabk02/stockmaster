import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  subscriptionGuard,
  checkUserLimit,
} from "../middlewares/subscriptionGuard";

const router = Router();

router.use(authMiddleware);

router.get("/", UserController.getTeam);
router.get("/team", UserController.getTeam);
router.get("/profile/:id", UserController.getProfile);
router.get("/performance", UserController.getTeamPerformance);
router.get("/activity/:id", UserController.getUserActivity);
router.post(
  "/",
  subscriptionGuard,
  checkUserLimit,
  UserController.createMember,
);
router.put("/:id", UserController.updateMember);
router.post("/:id/follow", UserController.toggleFollow);
router.delete("/:id", UserController.removeMember);

// allow users to update their own preferences (language, notifications, dark mode)
router.patch("/preferences", UserController.updatePreferences);

export default router;
