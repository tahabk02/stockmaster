import { Router } from "express";
import { IntegrationController } from "../controllers/integration.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/", IntegrationController.getIntegrations);
router.post("/", IntegrationController.createIntegration);
router.get("/webhooks", IntegrationController.getWebhooks);
router.post("/webhooks", IntegrationController.createWebhook);

export default router;
