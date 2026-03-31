import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";
import {
  authMiddleware as authenticate,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
