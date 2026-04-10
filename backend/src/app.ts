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
const allowedOrigins = [
  "https://stockmaster-6kas.vercel.app",
  "https://stockmaster-6kas.vercel.app/",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow if:
    // 1. No origin (like mobile apps or curl)
    // 2. Exact match in allowedOrigins
    // 3. Vercel preview/production deployment (*.vercel.app)
    // 4. Development environment
    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
    const isVercelOrigin = origin && (origin.endsWith(".vercel.app") || origin.includes("vercel.app"));
    const isDev = process.env.NODE_ENV === "development";

    if (isAllowedOrigin || isVercelOrigin || isDev) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-tenant-id"]
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
