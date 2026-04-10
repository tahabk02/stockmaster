import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import apiRoutes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { handleStripeWebhook } from "./controllers/stripe.webhook.controller"; 

const app: Application = express();

// --- 1. ROBUST CORS CONFIGURATION ---
app.use(cors({
  origin: 'https://stockmaster-6kas.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Handle preflight requests
app.options("*", cors());

// --- 2. STRIPE WEBHOOK (Needs raw body) ---
app.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// --- 3. SECURITY & LOGGING ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(morgan("combined"));

// --- 4. BODY PARSING ---
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- 5. FORENSIC AUDIT ---
import { forensicAuditMiddleware } from "./middlewares/audit.middleware";
app.use("/api", forensicAuditMiddleware);

// --- 6. DOCUMENTATION ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 7. ROUTES ---
app.use("/api", apiRoutes);
app.use("/", apiRoutes); 

// --- 8. ERROR HANDLING ---
app.use(errorMiddleware);

export default app;
