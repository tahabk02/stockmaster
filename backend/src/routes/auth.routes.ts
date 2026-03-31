import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Paths: /api/auth/login  و  /api/auth/register
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Profile and Password Management
router.get("/profile", authMiddleware, AuthController.getProfile);
router.put("/profile", authMiddleware, AuthController.updateProfile);
router.put("/change-password", authMiddleware, AuthController.changePassword);

export default router;
