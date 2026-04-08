import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import apiRoutes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import { handleStripeWebhook } from "./controllers/stripe.webhook.controller"; // Import webhook handler

const app: Application = express();

// Stripe Webhook: This route needs the raw body, so it must come BEFORE express.json()
app.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Security & Logging Middlewares
app.use(helmet());
app.use(morgan("combined"));

const allowedOrigins = [
  "https://stockmaster-6kas.vercel.app",
  "http://localhost:5173", // Local development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body Parsing
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Forensic Audit (Intercepts write operations)
import { forensicAuditMiddleware } from "./middlewares/audit.middleware";
app.use("/api", forensicAuditMiddleware);

// Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate Limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
