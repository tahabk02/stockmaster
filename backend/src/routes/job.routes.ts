import express from "express";
import { getJobs, runJob, runAllJobs } from "../controllers/job.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

// GET /api/jobs - Fetch all background processes
router.get("/", getJobs);

// POST /api/jobs/run-all - Trigger global synchronization
router.post("/run-all", runAllJobs);

// POST /api/jobs/:id/run - Trigger specific node
router.post("/:id/run", runJob);

export default router;
