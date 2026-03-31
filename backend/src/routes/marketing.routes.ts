import { Router } from "express";
import { MarketingController } from "../controllers/marketing.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", MarketingController.getCampaigns);
router.post("/", MarketingController.createCampaign);
router.patch("/:id/status", MarketingController.updateStatus);

export default router;
