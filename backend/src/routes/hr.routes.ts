import { Router } from "express";
import { HRController } from "../controllers/hr.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/clock-in", HRController.clockIn);
router.post("/clock-out", HRController.clockOut);
router.get("/my-attendance", HRController.getMyAttendance);
router.get("/team-attendance", HRController.getTeamAttendance);

export default router;
